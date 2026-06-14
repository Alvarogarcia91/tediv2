from django.contrib import admin
from .models import SystemEvent, InAppNotification

@admin.register(SystemEvent)
class SystemEventAdmin(admin.ModelAdmin):
    list_display = ('id', 'event_type', 'title', 'child', 'actor', 'created_at')
    list_filter = ('event_type', 'created_at')
    search_fields = ('title', 'message')


@admin.register(InAppNotification)
class InAppNotificationAdmin(admin.ModelAdmin):
    list_display = ('id', 'recipient', 'title', 'notification_type', 'is_read', 'created_at')
    list_filter = ('notification_type', 'is_read', 'created_at')
    search_fields = ('title', 'message', 'recipient__username')
