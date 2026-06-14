from django.db import models, transaction
from django.conf import settings
from django.utils import timezone
from children.models import TimestampMixin, Child


class HourPackage(TimestampMixin):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    hours = models.DecimalField(max_digits=5, decimal_places=2)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    is_active = models.BooleanField(default=True)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['sort_order', 'id']

    def __str__(self):
        return f"{self.name} ({self.hours} hours)"

    @property
    def minutes(self):
        return int(self.hours * 60)


class ChildHourBalance(models.Model):
    child = models.OneToOneField(
        Child,
        on_delete=models.CASCADE,
        related_name="hour_balance"
    )
    available_minutes = models.IntegerField(default=0)
    total_purchased_minutes = models.IntegerField(default=0)
    total_consumed_minutes = models.IntegerField(default=0)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Balance for {self.child.full_name}: {self.available_minutes} min available"

    def add_purchased_minutes(self, minutes):
        with transaction.atomic():
            # Refresh from DB to prevent race conditions
            obj = ChildHourBalance.objects.select_for_update().get(pk=self.pk)
            obj.available_minutes += minutes
            obj.total_purchased_minutes += minutes
            obj.save()
            # Sync local instance fields
            self.available_minutes = obj.available_minutes
            self.total_purchased_minutes = obj.total_purchased_minutes

    def consume_minutes(self, minutes):
        with transaction.atomic():
            obj = ChildHourBalance.objects.select_for_update().get(pk=self.pk)
            if obj.available_minutes >= minutes:
                obj.available_minutes -= minutes
                obj.total_consumed_minutes += minutes
                obj.save()
                # Sync local instance fields
                self.available_minutes = obj.available_minutes
                self.total_consumed_minutes = obj.total_consumed_minutes
                return True
            return False


class HourPurchase(TimestampMixin):
    PAYMENT_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('cancelled', 'Cancelled'),
    ]

    PAYMENT_METHOD_CHOICES = [
        ('cash', 'Cash'),
        ('card', 'Card'),
        ('transfer', 'Transfer'),
        ('other', 'Other'),
    ]

    child = models.ForeignKey(
        Child,
        on_delete=models.CASCADE,
        related_name="hour_purchases"
    )
    package = models.ForeignKey(
        HourPackage,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="hour_purchases"
    )
    purchased_minutes = models.IntegerField()
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_status = models.CharField(
        max_length=20,
        choices=PAYMENT_STATUS_CHOICES,
        default='pending'
    )
    payment_method = models.CharField(
        max_length=20,
        choices=PAYMENT_METHOD_CHOICES,
        default='cash'
    )
    payment_reference = models.CharField(max_length=100, blank=True)
    notes = models.TextField(blank=True)
    purchased_at = models.DateTimeField(default=timezone.now)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_purchases"
    )
    _balance_credited = models.BooleanField(default=False)

    def __str__(self):
        return f"Purchase #{self.id} for {self.child.full_name} ({self.purchased_minutes} min)"

    def save(self, *args, **kwargs):
        # Auto fill values if package is set and fields are not provided or default/empty
        if self.package:
            if not self.purchased_minutes:
                self.purchased_minutes = self.package.minutes
            if not self.amount:
                self.amount = self.package.price

        with transaction.atomic():
            # Perform DB save first so we have an ID if it's a new instance
            super().save(*args, **kwargs)

            # Credit balance if status is paid and it hasn't been credited yet
            if self.payment_status == 'paid' and not self._balance_credited:
                # Get or create child hour balance
                balance, _ = ChildHourBalance.objects.get_or_create(child=self.child)
                balance.add_purchased_minutes(self.purchased_minutes)
                
                # Update flag to prevent double-crediting
                self._balance_credited = True
                # Use update to avoid calling save() recursively
                HourPurchase.objects.filter(pk=self.pk).update(_balance_credited=True)

                # Trigger notification safely
                try:
                    from notifications.services import create_package_paid_event
                    create_package_paid_event(self)
                except Exception as e:
                    import logging
                    logger = logging.getLogger(__name__)
                    logger.error(f"Error creating package paid notification: {e}", exc_info=True)
