from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from children.models import ParentProfile, Child
from datetime import date


class Command(BaseCommand):
    help = 'Seed demo parent and children data'

    def handle(self, *args, **options):
        User = get_user_model()
        
        # 1. Create or update user maria.garcia
        username = "maria.garcia"
        email = "maria.garcia@example.com"
        password = "Tedi123#"
        
        user, created = User.objects.get_or_create(
            username=username,
            defaults={
                'email': email,
                'first_name': 'María',
                'last_name': 'García',
                'is_parent': True,
            }
        )
        
        if not created:
            user.email = email
            user.first_name = 'María'
            user.last_name = 'García'
            user.is_parent = True
            user.set_password(password)
            user.save()
            self.stdout.write(self.style.SUCCESS(f'Demo user "{username}" updated.'))
        else:
            user.set_password(password)
            user.save()
            self.stdout.write(self.style.SUCCESS(f'Demo user "{username}" created.'))
            
        # Assign to parent group
        parent_group, _ = Group.objects.get_or_create(name='parent')
        if not user.groups.filter(name='parent').exists():
            user.groups.add(parent_group)
            self.stdout.write(self.style.SUCCESS(f'User "{username}" added to group "parent".'))
            
        # 2. Create or update ParentProfile for María García
        parent_profile, p_created = ParentProfile.objects.get_or_create(
            user=user,
            defaults={
                'phone': '6641234567',
                'whatsapp': '6641234567',
                'emergency_contact_name': 'Juan García',
                'emergency_contact_phone': '6647654321',
            }
        )
        
        if not p_created:
            parent_profile.phone = '6641234567'
            parent_profile.whatsapp = '6641234567'
            parent_profile.emergency_contact_name = 'Juan García'
            parent_profile.emergency_contact_phone = '6647654321'
            parent_profile.save()
            self.stdout.write(self.style.SUCCESS('Parent profile for María García updated.'))
        else:
            self.stdout.write(self.style.SUCCESS('Parent profile for María García created.'))
            
        # 3. Create or update Child 1: Sofía García
        sofia, s_created = Child.objects.get_or_create(
            first_name='Sofía',
            last_name='García',
            defaults={
                'date_of_birth': date(2021, 5, 10),
            }
        )
        if not s_created:
            sofia.date_of_birth = date(2021, 5, 10)
            sofia.save()
            self.stdout.write(self.style.SUCCESS('Child "Sofía García" updated.'))
        else:
            self.stdout.write(self.style.SUCCESS('Child "Sofía García" created.'))
            
        if not sofia.parent_profiles.filter(id=parent_profile.id).exists():
            sofia.parent_profiles.add(parent_profile)
            self.stdout.write(self.style.SUCCESS('Linked "Sofía García" to María García profile.'))
            
        # 4. Create or update Child 2: Mateo García
        mateo, m_created = Child.objects.get_or_create(
            first_name='Mateo',
            last_name='García',
            defaults={
                'date_of_birth': date(2023, 2, 15),
            }
        )
        if not m_created:
            mateo.date_of_birth = date(2023, 2, 15)
            mateo.save()
            self.stdout.write(self.style.SUCCESS('Child "Mateo García" updated.'))
        else:
            self.stdout.write(self.style.SUCCESS('Child "Mateo García" created.'))
            
        if not mateo.parent_profiles.filter(id=parent_profile.id).exists():
            mateo.parent_profiles.add(parent_profile)
            self.stdout.write(self.style.SUCCESS('Linked "Mateo García" to María García profile.'))
            
        self.stdout.write(self.style.SUCCESS('Demo data seeding completed successfully!'))
