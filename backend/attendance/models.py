from django.db import models, transaction
from django.conf import settings
from django.utils import timezone
from children.models import TimestampMixin, Child
from billing.models import ChildHourBalance


class AttendanceSettings(models.Model):
    default_tolerance_minutes = models.IntegerField(default=10)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Attendance Settings (Tolerance: {self.default_tolerance_minutes} min)"

    @classmethod
    def get_settings(cls):
        obj, created = cls.objects.get_or_create(id=1, defaults={'default_tolerance_minutes': 10})
        return obj


class AttendanceRecord(TimestampMixin):
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    child = models.ForeignKey(
        Child,
        on_delete=models.CASCADE,
        related_name="attendance_records"
    )
    checked_in_at = models.DateTimeField(default=timezone.now)
    checked_out_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='active'
    )
    raw_minutes = models.IntegerField(null=True, blank=True)
    billable_minutes = models.IntegerField(null=True, blank=True)
    tolerance_minutes = models.IntegerField(default=10)
    uncovered_minutes = models.IntegerField(default=0)
    notes = models.TextField(blank=True)
    checked_in_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="checked_in_records"
    )
    checked_out_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="checked_out_records"
    )

    def __str__(self):
        return f"Record #{self.id} - {self.child.full_name} ({self.status})"

    @classmethod
    def check_in(cls, child, user, notes=""):
        if not child.is_active:
            raise ValueError("Child is not active.")

        # Check if already active
        if cls.objects.filter(child=child, status='active').exists():
            raise ValueError("Child already has an active attendance record.")

        # Check if child has available balance > 0
        balance, _ = ChildHourBalance.objects.get_or_create(child=child)
        if balance.available_minutes <= 0:
            raise ValueError("Child does not have available hour balance.")

        settings_obj = AttendanceSettings.get_settings()
        
        return cls.objects.create(
            child=child,
            checked_in_by=user,
            status='active',
            tolerance_minutes=settings_obj.default_tolerance_minutes,
            notes=notes,
            checked_in_at=timezone.now(),
        )

    def check_out(self, user, notes=""):
        if self.status != 'active':
            raise ValueError("Record is not active.")

        with transaction.atomic():
            self.checked_out_at = timezone.now()
            self.checked_out_by = user
            
            # Calculate duration in minutes
            duration = self.checked_out_at - self.checked_in_at
            self.raw_minutes = max(0, int(duration.total_seconds() / 60.0))

            # Apply tolerance
            if self.raw_minutes <= self.tolerance_minutes:
                self.billable_minutes = 0
            else:
                self.billable_minutes = self.raw_minutes

            # Deduct from balance
            if self.billable_minutes > 0:
                balance, _ = ChildHourBalance.objects.select_for_update().get_or_create(child=self.child)
                available = balance.available_minutes
                
                if available >= self.billable_minutes:
                    balance.consume_minutes(self.billable_minutes)
                    self.uncovered_minutes = 0
                else:
                    # Consume everything available and record remainder as uncovered
                    balance.consume_minutes(available)
                    self.uncovered_minutes = self.billable_minutes - available
            else:
                self.uncovered_minutes = 0

            self.status = 'completed'
            if notes:
                self.notes = f"{self.notes}\n{notes}".strip()
            self.save()

    def cancel(self, user, notes=""):
        if self.status != 'active':
            raise ValueError("Only active records can be cancelled.")

        self.status = 'cancelled'
        self.checked_out_at = timezone.now()
        self.checked_out_by = user
        if notes:
            self.notes = f"{self.notes}\nCancelled: {notes}".strip()
        self.save()
