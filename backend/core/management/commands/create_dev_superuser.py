import os
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model


class Command(BaseCommand):
    help = 'Create a superuser for development if it does not already exist'

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

        if User.objects.filter(username=username).exists():
            self.stdout.write(self.style.SUCCESS(f'Superuser "{username}" already exists.'))
            user = User.objects.get(username=username)
            user.email = email
            user.set_password(password)
            user.save()
            self.stdout.write(self.style.SUCCESS(f'Superuser "{username}" details updated.'))
        else:
            User.objects.create_superuser(
                username=username,
                email=email,
                password=password
            )
            self.stdout.write(self.style.SUCCESS(f'Superuser "{username}" created successfully.'))
