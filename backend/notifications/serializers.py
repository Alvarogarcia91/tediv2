from rest_framework import serializers
from .models import InAppNotification

class InAppNotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = InAppNotification
        fields = [
            'id', 'event', 'title', 'message', 
            'notification_type', 'is_read', 'read_at', 'created_at'
        ]
        read_only_fields = ['id', 'event', 'title', 'message', 'notification_type', 'read_at', 'created_at']
