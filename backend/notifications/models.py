from django.db import models
from django.conf import settings
from children.models import Child, ParentProfile

class SystemEvent(models.Model):
    EVENT_TYPE_CHOICES = [
        ('child_checked_in', 'Child Checked In'),
        ('child_checked_out', 'Child Checked Out'),
        ('balance_consumed', 'Balance Consumed'),
        ('low_balance', 'Low Balance'),
        ('package_paid', 'Package Paid'),
        ('manual_notice', 'Manual Notice'),
    ]

    event_type = models.CharField(max_length=50, choices=EVENT_TYPE_CHOICES)
    title = models.CharField(max_length=200)
    message = models.TextField()
    child = models.ForeignKey(Child, on_delete=models.SET_NULL, null=True, blank=True)
    parent_profile = models.ForeignKey(ParentProfile, on_delete=models.SET_NULL, null=True, blank=True)
    actor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.get_event_type_display()} - {self.title}"


class InAppNotification(models.Model):
    NOTIFICATION_TYPE_CHOICES = [
        ('info', 'Info'),
        ('success', 'Success'),
        ('warning', 'Warning'),
        ('error', 'Error'),
    ]

    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notifications"
    )
    event = models.ForeignKey(SystemEvent, on_delete=models.SET_NULL, null=True, blank=True)
    title = models.CharField(max_length=200)
    message = models.TextField()
    notification_type = models.CharField(
        max_length=20,
        choices=NOTIFICATION_TYPE_CHOICES,
        default='info'
    )
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Notification for {self.recipient.username}: {self.title} (Read: {self.is_read})"
