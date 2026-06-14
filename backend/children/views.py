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


from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from billing.models import ChildHourBalance
from attendance.models import AttendanceRecord
from notifications.models import InAppNotification

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def parent_summary_view(request):
    user = request.user
    if not hasattr(user, 'parent_profile'):
        return Response({"detail": "User does not have a parent profile."}, status=status.HTTP_403_FORBIDDEN)
        
    parent_profile = user.parent_profile
    
    children_data = []
    for child in parent_profile.children.all():
        balance, _ = ChildHourBalance.objects.get_or_create(child=child)
        
        last_rec = AttendanceRecord.objects.filter(child=child).order_by('-checked_in_at').first()
        if last_rec:
            last_attendance = {
                "id": last_rec.id,
                "checked_in_at": last_rec.checked_in_at,
                "checked_out_at": last_rec.checked_out_at,
                "status": last_rec.status,
            }
        else:
            last_attendance = None
            
        active_attendance = AttendanceRecord.objects.filter(child=child, status='active').exists()
        
        children_data.append({
            "id": child.id,
            "full_name": child.full_name,
            "unique_code": child.unique_code,
            "available_minutes": balance.available_minutes,
            "available_hours": float(balance.available_minutes) / 60.0,
            "active_attendance": active_attendance,
            "last_attendance": last_attendance
        })
        
    unread_count = InAppNotification.objects.filter(recipient=user, is_read=False).count()
    
    return Response({
        "parent": {
            "id": parent_profile.id,
            "name": user.get_full_name() or user.username,
            "email": user.email
        },
        "children": children_data,
        "unread_notifications": unread_count
    }, status=status.HTTP_200_OK)
