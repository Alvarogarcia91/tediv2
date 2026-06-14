from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import AttendanceSettings, AttendanceRecord
from .serializers import AttendanceSettingsSerializer, AttendanceRecordSerializer
from children.models import Child


class IsStaffOrAdmin(permissions.BasePermission):
    """
    Allows full access to admin, superusers, and staff.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return (
            request.user.is_superuser or 
            request.user.is_staff or 
            request.user.groups.filter(name__in=['super_admin', 'admin', 'staff']).exists()
        )


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def list_records(request):
    """
    GET /api/attendance/records/
    Parents can view their own kids' records. Staff/Admin view all.
    """
    user = request.user
    is_staff = (
        user.is_superuser or
        user.is_staff or
        user.groups.filter(name__in=['super_admin', 'admin', 'staff']).exists()
    )
    if is_staff:
        records = AttendanceRecord.objects.all().order_by('-checked_in_at')
    else:
        records = AttendanceRecord.objects.filter(child__parent_profiles__user=user).order_by('-checked_in_at')
        
    serializer = AttendanceRecordSerializer(records, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsStaffOrAdmin])
def check_in_view(request):
    """
    POST /api/attendance/check-in/
    body: { "child": id, "notes": "" }
    """
    child_id = request.data.get('child')
    notes = request.data.get('notes', '')
    
    if not child_id:
        return Response({"detail": "Child ID is required."}, status=status.HTTP_400_BAD_REQUEST)
        
    try:
        child = Child.objects.get(pk=child_id)
        record = AttendanceRecord.check_in(child, request.user, notes)
        
        # Trigger check-in event notification safely
        try:
            from notifications.services import create_child_checked_in_event
            create_child_checked_in_event(child, request.user)
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Error creating check-in notification: {e}", exc_info=True)
            
        serializer = AttendanceRecordSerializer(record)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    except Child.DoesNotExist:
        return Response({"detail": "Child not found."}, status=status.HTTP_404_NOT_FOUND)
    except ValueError as e:
        return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsStaffOrAdmin])
def check_out_view(request):
    """
    POST /api/attendance/check-out/
    body: { "child": id, "notes": "" }
    """
    child_id = request.data.get('child')
    notes = request.data.get('notes', '')
    
    if not child_id:
        return Response({"detail": "Child ID is required."}, status=status.HTTP_400_BAD_REQUEST)
        
    try:
        record = AttendanceRecord.objects.get(child_id=child_id, status='active')
        record.check_out(request.user, notes)
        
        # Trigger check-out and low-balance notifications safely
        try:
            from billing.models import ChildHourBalance
            balance, _ = ChildHourBalance.objects.get_or_create(child=record.child)
            remaining_minutes = balance.available_minutes
            
            from notifications.services import create_child_checked_out_event, create_low_balance_event
            create_child_checked_out_event(
                child=record.child,
                actor=request.user,
                billable_minutes=record.billable_minutes,
                remaining_minutes=remaining_minutes
            )
            
            if remaining_minutes <= 60:
                create_low_balance_event(child=record.child, remaining_minutes=remaining_minutes)
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Error creating check-out/low-balance notification: {e}", exc_info=True)
            
        serializer = AttendanceRecordSerializer(record)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except AttendanceRecord.DoesNotExist:
        return Response(
            {"detail": "No active attendance record found for this child."},
            status=status.HTTP_404_NOT_FOUND
        )
    except ValueError as e:
        return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsStaffOrAdmin])
def cancel_view(request):
    """
    POST /api/attendance/cancel/
    body: { "child": id, "notes": "" }
    """
    child_id = request.data.get('child')
    notes = request.data.get('notes', '')
    
    if not child_id:
        return Response({"detail": "Child ID is required."}, status=status.HTTP_400_BAD_REQUEST)
        
    try:
        record = AttendanceRecord.objects.get(child_id=child_id, status='active')
        record.cancel(request.user, notes)
        serializer = AttendanceRecordSerializer(record)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except AttendanceRecord.DoesNotExist:
        return Response(
            {"detail": "No active attendance record found for this child."},
            status=status.HTTP_404_NOT_FOUND
        )
    except ValueError as e:
        return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PATCH'])
@permission_classes([IsStaffOrAdmin])
def settings_view(request):
    """
    GET/PATCH /api/attendance/settings/
    """
    settings_obj = AttendanceSettings.get_settings()
    
    if request.method == 'GET':
        serializer = AttendanceSettingsSerializer(settings_obj)
        return Response(serializer.data, status=status.HTTP_200_OK)
        
    elif request.method == 'PATCH':
        serializer = AttendanceSettingsSerializer(settings_obj, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
