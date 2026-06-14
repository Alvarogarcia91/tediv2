from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group


class Command(BaseCommand):
    help = 'Seed initial roles/groups'

    def handle(self, *args, **options):
        roles = ['super_admin', 'admin', 'staff', 'parent']
        for role in roles:
            group, created = Group.objects.get_or_create(name=role)
            if created:
                self.stdout.write(self.style.SUCCESS(f'Role group "{role}" created.'))
            else:
                self.stdout.write(self.style.SUCCESS(f'Role group "{role}" already exists.'))
