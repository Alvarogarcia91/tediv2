from rest_framework import viewsets, permissions
from .models import ParentProfile, Child
from .serializers import ParentProfileSerializer, ChildSerializer


class IsStaffOrAdminOrOwner(permissions.BasePermission):
    """
    Custom permission to only allow admin/staff or owners to view/edit.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        # Admins, staff, or superusers can do anything
        if request.user.is_superuser or request.user.is_staff or request.user.groups.filter(name__in=['super_admin', 'admin', 'staff']).exists():
            return True
        
        # If it's a ParentProfile, check if it belongs to the user
        if isinstance(obj, ParentProfile):
            return obj.user == request.user
            
        # If it's a Child, check if the user is one of the parents
        if isinstance(obj, Child):
            return obj.parent_profiles.filter(user=request.user).exists()
            
        return False


class ParentProfileViewSet(viewsets.ModelViewSet):
    serializer_class = ParentProfileSerializer
    permission_classes = [IsStaffOrAdminOrOwner]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser or user.is_staff or user.groups.filter(name__in=['super_admin', 'admin', 'staff']).exists():
            return ParentProfile.objects.all()
        return ParentProfile.objects.filter(user=user)


class ChildViewSet(viewsets.ModelViewSet):
    serializer_class = ChildSerializer
    permission_classes = [IsStaffOrAdminOrOwner]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser or user.is_staff or user.groups.filter(name__in=['super_admin', 'admin', 'staff']).exists():
            return Child.objects.all()
        return Child.objects.filter(parent_profiles__user=user)
