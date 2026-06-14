from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from .models import HourPackage, ChildHourBalance, HourPurchase
from .serializers import HourPackageSerializer, ChildHourBalanceSerializer, HourPurchaseSerializer


class BillingPermission(permissions.BasePermission):
    """
    Custom permissions for billing.
    - Super_admin and admin can do anything (full write/read).
    - Staff can only view (GET: list, retrieve).
    - Parent can only view (GET: list, retrieve) and is restricted to their own children's records in get_queryset.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
            
        # Safe methods (GET, HEAD, OPTIONS)
        if request.method in permissions.SAFE_METHODS:
            return True
            
        # Write actions require admin/superuser/super_admin
        is_admin_or_super = (
            request.user.is_superuser or
            request.user.groups.filter(name__in=['super_admin', 'admin']).exists()
        )
        return is_admin_or_super

    def has_object_permission(self, request, view, obj):
        # Admins, superusers always allowed
        if request.user.is_superuser or request.user.groups.filter(name__in=['super_admin', 'admin']).exists():
            return True

        # Staff can view anything (SAFE_METHODS checked in has_permission)
        if request.user.is_staff or request.user.groups.filter(name='staff').exists():
            return request.method in permissions.SAFE_METHODS

        # Parents can view only their own kids' balances/purchases
        if request.method in permissions.SAFE_METHODS:
            if isinstance(obj, ChildHourBalance):
                return obj.child.parent_profiles.filter(user=request.user).exists()
            elif isinstance(obj, HourPurchase):
                return obj.child.parent_profiles.filter(user=request.user).exists()
            elif isinstance(obj, HourPackage):
                return True # All users can view packages
        
        return False


class HourPackageViewSet(viewsets.ModelViewSet):
    serializer_class = HourPackageSerializer
    permission_classes = [BillingPermission]
    queryset = HourPackage.objects.all()


class ChildHourBalanceViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ChildHourBalanceSerializer
    permission_classes = [BillingPermission]

    def get_queryset(self):
        user = self.request.user
        # Admins, superusers, and staff can view all balances
        if user.is_superuser or user.is_staff or user.groups.filter(name__in=['super_admin', 'admin', 'staff']).exists():
            return ChildHourBalance.objects.all()
        # Parents can only see balances of their own children
        return ChildHourBalance.objects.filter(child__parent_profiles__user=user)


class HourPurchaseViewSet(viewsets.ModelViewSet):
    serializer_class = HourPurchaseSerializer
    permission_classes = [BillingPermission]

    def get_queryset(self):
        user = self.request.user
        # Admins, superusers, and staff can view all purchases
        if user.is_superuser or user.is_staff or user.groups.filter(name__in=['super_admin', 'admin', 'staff']).exists():
            return HourPurchase.objects.all()
        # Parents can only see purchases of their own children
        return HourPurchase.objects.filter(child__parent_profiles__user=user)

    def perform_create(self, serializer):
        # Set created_by field automatically to current user
        serializer.save(created_by=self.request.user)
