from django.utils import timezone
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import InAppNotification
from .serializers import InAppNotificationSerializer

class InAppNotificationViewSet(viewsets.ModelViewSet):
    serializer_class = InAppNotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Admins/superusers can view all notifications, parents/regular users view only their own.
        if user.is_superuser or user.groups.filter(name__in=['super_admin', 'admin']).exists():
            return InAppNotification.objects.all().order_by('-created_at')
        return InAppNotification.objects.filter(recipient=user).order_by('-created_at')

    @action(detail=True, methods=['post'], url_path='mark-read')
    def mark_read(self, request, pk=None):
        notification = self.get_object()
        # Verify ownership unless admin/superuser
        if notification.recipient != request.user and not (
            request.user.is_superuser or request.user.groups.filter(name__in=['super_admin', 'admin']).exists()
        ):
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
            
        if not notification.is_read:
            notification.is_read = True
            notification.read_at = timezone.now()
            notification.save()
            
        serializer = self.get_serializer(notification)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], url_path='mark-all-read')
    def mark_all_read(self, request):
        # Even admins calling mark-all-read should only mark their own notifications as read
        notifications = InAppNotification.objects.filter(recipient=request.user, is_read=False)
        count = notifications.count()
        notifications.update(is_read=True, read_at=timezone.now())
        return Response({"detail": f"Marked {count} notifications as read."}, status=status.HTTP_200_OK)
