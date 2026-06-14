from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
from children.models import Child
from attendance.models import AttendanceSettings, AttendanceRecord

class Command(BaseCommand):
    help = 'Seed demo attendance settings and historical records'

    def handle(self, *args, **options):
        # 1. Initialize AttendanceSettings
        settings_obj = AttendanceSettings.get_settings()
        self.stdout.write(self.style.SUCCESS(
            f'Attendance settings set/verified: default_tolerance_minutes={settings_obj.default_tolerance_minutes}'
        ))

        # 2. Get user
        User = get_user_model()
        admin_user = User.objects.filter(username='alvaro.garcia').first()
        if not admin_user:
            admin_user = User.objects.filter(is_superuser=True).first()
        if not admin_user:
            self.stdout.write(self.style.ERROR('No admin user found. Run seed/superuser creation first.'))
            return

        # 3. Get child Sofia
        sofia = Child.objects.filter(first_name='Sofía', last_name='García').first()
        if not sofia:
            self.stdout.write(self.style.ERROR('Child "Sofía García" not found. Run seed_demo_children first.'))
            return

        mateo = Child.objects.filter(first_name='Mateo', last_name='García').first()

        now = timezone.now()

        # Seed historical record 1 (Sofia - Completed: 120 minutes)
        t1_in = now - timedelta(days=3, hours=4)
        t1_out = t1_in + timedelta(minutes=120)
        rec1, created1 = AttendanceRecord.objects.get_or_create(
            child=sofia,
            checked_in_at=t1_in,
            defaults={
                'checked_out_at': t1_out,
                'status': 'completed',
                'raw_minutes': 120,
                'billable_minutes': 120,
                'tolerance_minutes': 10,
                'uncovered_minutes': 0,
                'notes': 'Demo historical record 120 mins',
                'checked_in_by': admin_user,
                'checked_out_by': admin_user,
            }
        )
        if created1:
            self.stdout.write(self.style.SUCCESS(f'Historical record 1 created for Sofia.'))
        else:
            self.stdout.write(self.style.SUCCESS(f'Historical record 1 already exists.'))

        # Seed historical record 2 (Sofia - Completed: 5 minutes - within tolerance)
        t2_in = now - timedelta(days=2, hours=2)
        t2_out = t2_in + timedelta(minutes=5)
        rec2, created2 = AttendanceRecord.objects.get_or_create(
            child=sofia,
            checked_in_at=t2_in,
            defaults={
                'checked_out_at': t2_out,
                'status': 'completed',
                'raw_minutes': 5,
                'billable_minutes': 0,
                'tolerance_minutes': 10,
                'uncovered_minutes': 0,
                'notes': 'Demo historical record 5 mins (within tolerance)',
                'checked_in_by': admin_user,
                'checked_out_by': admin_user,
            }
        )
        if created2:
            self.stdout.write(self.style.SUCCESS(f'Historical record 2 created for Sofia.'))
        else:
            self.stdout.write(self.style.SUCCESS(f'Historical record 2 already exists.'))

        if mateo:
            # Seed historical record 3 (Mateo - Cancelled)
            t3_in = now - timedelta(days=1, hours=5)
            rec3, created3 = AttendanceRecord.objects.get_or_create(
                child=mateo,
                checked_in_at=t3_in,
                defaults={
                    'checked_out_at': t3_in + timedelta(minutes=10),
                    'status': 'cancelled',
                    'raw_minutes': 10,
                    'billable_minutes': 0,
                    'tolerance_minutes': 10,
                    'uncovered_minutes': 0,
                    'notes': 'Demo historical record cancelled',
                    'checked_in_by': admin_user,
                    'checked_out_by': admin_user,
                }
            )
            if created3:
                self.stdout.write(self.style.SUCCESS(f'Historical record 3 (cancelled) created for Mateo.'))
            else:
                self.stdout.write(self.style.SUCCESS(f'Historical record 3 already exists.'))

        self.stdout.write(self.style.SUCCESS('Attendance data seeding completed successfully!'))
