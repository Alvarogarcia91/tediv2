from django.core.management.base import BaseCommand
from billing.models import HourPackage, HourPurchase, ChildHourBalance
from children.models import Child
from django.contrib.auth import get_user_model
from django.utils import timezone


class Command(BaseCommand):
    help = 'Seed billing packages and demo purchase data'

    def handle(self, *args, **options):
        # 1. Create packages
        packages_data = [
            {'name': 'Paquete 5 horas', 'hours': 5.00, 'price': 500.00, 'sort_order': 1},
            {'name': 'Paquete 10 horas', 'hours': 10.00, 'price': 900.00, 'sort_order': 2},
            {'name': 'Paquete 20 horas', 'hours': 20.00, 'price': 1600.00, 'sort_order': 3},
        ]
        
        seeded_packages = {}
        for pkg_info in packages_data:
            pkg, created = HourPackage.objects.get_or_create(
                name=pkg_info['name'],
                defaults={
                    'hours': pkg_info['hours'],
                    'price': pkg_info['price'],
                    'sort_order': pkg_info['sort_order'],
                }
            )
            if not created:
                pkg.hours = pkg_info['hours']
                pkg.price = pkg_info['price']
                pkg.sort_order = pkg_info['sort_order']
                pkg.save()
                self.stdout.write(self.style.SUCCESS(f'Package "{pkg.name}" updated.'))
            else:
                self.stdout.write(self.style.SUCCESS(f'Package "{pkg.name}" created.'))
            seeded_packages[pkg.name] = pkg

        # 2. Get user and child for demo purchase
        User = get_user_model()
        creator = User.objects.filter(is_superuser=True).first()
        
        sofia = Child.objects.filter(first_name='Sofía', last_name='García').first()
        if not sofia:
            self.stdout.write(self.style.ERROR('Child "Sofía García" not found. Run seed_demo_children first.'))
            return
            
        pkg_10 = seeded_packages['Paquete 10 horas']
        
        # 3. Create paid purchase for Sofia
        ref = 'DEMO-CASH-001'
        purchase, created = HourPurchase.objects.get_or_create(
            payment_reference=ref,
            defaults={
                'child': sofia,
                'package': pkg_10,
                'purchased_minutes': pkg_10.minutes,
                'amount': pkg_10.price,
                'payment_status': 'paid',
                'payment_method': 'cash',
                'notes': 'Compra demo inicial',
                'created_by': creator,
                'purchased_at': timezone.now(),
            }
        )
        
        if created:
            self.stdout.write(self.style.SUCCESS(f'Purchase {ref} created and balance credited.'))
        else:
            # Check if it was credited. If it was already created but somehow not credited (or updated)
            # but since get_or_create didn't run save() if not created, let's save to invoke the logic
            # just in case, but actually it shouldn't re-credit because _balance_credited is True.
            self.stdout.write(self.style.SUCCESS(f'Purchase {ref} already exists.'))
            
        # Verify balance
        balance = ChildHourBalance.objects.filter(child=sofia).first()
        if balance:
            self.stdout.write(self.style.SUCCESS(f'Sofía García hours balance: {balance.available_minutes} minutes.'))
        else:
            self.stdout.write(self.style.ERROR('Sofía García has no hours balance record.'))
            
        self.stdout.write(self.style.SUCCESS('Billing data seeding completed successfully!'))
