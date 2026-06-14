import os
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group


class Command(BaseCommand):
    help = 'Create a superuser for development and assign to super_admin group'

    def handle(self, *args, **options):
        User = get_user_model()
        username = os.environ.get('DJANGO_SUPERUSER_USERNAME', 'alvaro.garcia')
        email = os.environ.get('DJANGO_SUPERUSER_EMAIL', 'alvaro.garcia@itnexora.com')
        password = os.environ.get('DJANGO_SUPERUSER_PASSWORD', 'Tedi123#')

        if not username or not password:
            self.stdout.write(self.style.WARNING(
                'DJANGO_SUPERUSER_USERNAME or DJANGO_SUPERUSER_PASSWORD not configured. Skipping superuser creation.'
            ))
            return

        # Get or create the user
        user_exists = User.objects.filter(username=username).exists()
        if user_exists:
            self.stdout.write(self.style.SUCCESS(f'Superuser "{username}" already exists. Updating details...'))
            user = User.objects.get(username=username)
            user.email = email
            user.set_password(password)
            user.is_staff = True
            user.is_superuser = True
            user.save()
        else:
            user = User.objects.create_superuser(
                username=username,
                email=email,
                password=password
            )
            self.stdout.write(self.style.SUCCESS(f'Superuser "{username}" created successfully.'))

        # Assign to super_admin group
        super_admin_group = Group.objects.filter(name='super_admin').first()
        if super_admin_group:
            if not user.groups.filter(name='super_admin').exists():
                user.groups.add(super_admin_group)
                self.stdout.write(self.style.SUCCESS(f'Assigned user "{username}" to group "super_admin".'))
            else:
                self.stdout.write(self.style.SUCCESS(f'User "{username}" is already in group "super_admin".'))
        else:
            self.stdout.write(self.style.ERROR('Group "super_admin" does not exist. Please run seed_roles first.'))
