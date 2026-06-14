import random
import string
from datetime import date
from django.db import models
from django.conf import settings


class TimestampMixin(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class ParentProfile(TimestampMixin):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="parent_profile"
    )
    phone = models.CharField(max_length=20)
    whatsapp = models.CharField(max_length=20, blank=True)
    emergency_contact_name = models.CharField(max_length=100)
    emergency_contact_phone = models.CharField(max_length=20)
    address = models.TextField(blank=True)
    notes = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"Parent: {self.user.get_full_name() or self.user.username}"


class Child(TimestampMixin):
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    date_of_birth = models.DateField()
    parent_profiles = models.ManyToManyField(
        ParentProfile,
        related_name="children"
    )
    unique_code = models.CharField(max_length=10, unique=True, blank=True)
    allergies = models.TextField(blank=True)
    medical_notes = models.TextField(blank=True)
    authorized_pickup_notes = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"

    @property
    def age(self):
        if not self.date_of_birth:
            return None
        today = date.today()
        # Calculate age
        age_years = today.year - self.date_of_birth.year - (
            (today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day)
        )
        return age_years

    def generate_unique_code(self):
        length = 6
        chars = string.ascii_uppercase + string.digits
        while True:
            code = ''.join(random.choices(chars, k=length))
            if not Child.objects.filter(unique_code=code).exists():
                return code

    def save(self, *args, **kwargs):
        if not self.unique_code:
            self.unique_code = self.generate_unique_code()
        super().save(*args, **kwargs)
