from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from children.models import ParentProfile, Child
from billing.models import ChildHourBalance
from datetime import date
import random

class Command(BaseCommand):
    help = 'Seed a large set of parent, children, staff, and balances for testing'

    def handle(self, *args, **options):
        User = get_user_model()
        self.stdout.write("Starting large database seeding...")

        # Groups Setup
        parent_group, _ = Group.objects.get_or_create(name='parent')
        staff_group, _ = Group.objects.get_or_create(name='staff')

        # 1. Create Staff Users
        staff_users = [
            {"username": "staff.one", "first_name": "Laura", "last_name": "Torres", "email": "laura.torres@example.com"},
            {"username": "staff.two", "first_name": "Diego", "last_name": "Ruiz", "email": "diego.ruiz@example.com"}
        ]
        
        for su in staff_users:
            user, created = User.objects.get_or_create(
                username=su["username"],
                defaults={
                    "email": su["email"],
                    "first_name": su["first_name"],
                    "last_name": su["last_name"],
                    "is_staff": True,
                }
            )
            user.set_password("Tedi123#")
            user.save()
            if not user.groups.filter(name='staff').exists():
                user.groups.add(staff_group)
            self.stdout.write(self.style.SUCCESS(f"Staff user {su['username']} set up successfully."))

        # 2. Create 10 Parent Users & Profiles
        parents_info = [
            # Dads
            {"username": "carlos.gomez", "first_name": "Carlos", "last_name": "Gómez", "email": "carlos.gomez@example.com", "phone": "6640000001"},
            {"username": "pedro.martinez", "first_name": "Pedro", "last_name": "Martínez", "email": "pedro.martinez@example.com", "phone": "6640000002"},
            {"username": "luis.hernandez", "first_name": "Luis", "last_name": "Hernández", "email": "luis.hernandez@example.com", "phone": "6640000003"},
            {"username": "jorge.diaz", "first_name": "Jorge", "last_name": "Díaz", "email": "jorge.diaz@example.com", "phone": "6640000004"},
            {"username": "juan.perez", "first_name": "Juan", "last_name": "Pérez", "email": "juan.perez@example.com", "phone": "6640000005"},
            # Moms
            {"username": "ana.gomez", "first_name": "Ana", "last_name": "Gómez", "email": "ana.gomez@example.com", "phone": "6640000006"},
            {"username": "maria.rodriguez", "first_name": "María", "last_name": "Rodríguez", "email": "maria.rodriguez@example.com", "phone": "6640000007"},
            {"username": "lucia.sanchez", "first_name": "Lucía", "last_name": "Sánchez", "email": "lucia.sanchez@example.com", "phone": "6640000008"},
            {"username": "elena.castro", "first_name": "Elena", "last_name": "Castro", "email": "elena.castro@example.com", "phone": "6640000009"},
            {"username": "sofia.ramirez", "first_name": "Sofía", "last_name": "Ramírez", "email": "sofia.ramirez@example.com", "phone": "6640000010"},
        ]

        parent_profiles = []
        for p in parents_info:
            user, created = User.objects.get_or_create(
                username=p["username"],
                defaults={
                    "email": p["email"],
                    "first_name": p["first_name"],
                    "last_name": p["last_name"],
                    "is_parent": True,
                }
            )
            user.set_password("Tedi123#")
            user.save()
            if not user.groups.filter(name='parent').exists():
                user.groups.add(parent_group)

            profile, p_created = ParentProfile.objects.get_or_create(
                user=user,
                defaults={
                    "phone": p["phone"],
                    "whatsapp": p["phone"],
                    "emergency_contact_name": "Contacto Emergencia",
                    "emergency_contact_phone": "6649999999",
                }
            )
            parent_profiles.append(profile)
            self.stdout.write(self.style.SUCCESS(f"Parent user {p['username']} set up successfully."))

        # 3. Create 15 Children
        children_info = [
            {"first_name": "Valentina", "last_name": "Gómez", "dob": date(2020, 1, 15)}, # Will be shared
            {"first_name": "Mateo", "last_name": "Gómez", "dob": date(2022, 6, 20)},
            {"first_name": "Sofía", "last_name": "Martínez", "dob": date(2021, 3, 5)},
            {"first_name": "Santiago", "last_name": "Martínez", "dob": date(2019, 11, 10)},
            {"first_name": "Camila", "last_name": "Hernández", "dob": date(2020, 8, 25)},
            {"first_name": "Lucas", "last_name": "Hernández", "dob": date(2023, 1, 12)},
            {"first_name": "Isabella", "last_name": "Díaz", "dob": date(2021, 5, 30)},
            {"first_name": "Daniel", "last_name": "Pérez", "dob": date(2022, 9, 8)},
            {"first_name": "Martina", "last_name": "Rodríguez", "dob": date(2020, 4, 18)},
            {"first_name": "Sebastián", "last_name": "Rodríguez", "dob": date(2018, 7, 22)},
            {"first_name": "Luciana", "last_name": "Sánchez", "dob": date(2021, 10, 1)},
            {"first_name": "Enzo", "last_name": "Sánchez", "dob": date(2023, 4, 5)},
            {"first_name": "Julieta", "last_name": "Castro", "dob": date(2019, 2, 28)},
            {"first_name": "Matías", "last_name": "Ramírez", "dob": date(2022, 12, 15)},
            {"first_name": "Alejandro", "last_name": "Ramírez", "dob": date(2020, 6, 14)}
        ]

        children = []
        for c in children_info:
            child, created = Child.objects.get_or_create(
                first_name=c["first_name"],
                last_name=c["last_name"],
                defaults={"date_of_birth": c["dob"]}
            )
            children.append(child)
            
            # Setup Hour Balance
            balance, _ = ChildHourBalance.objects.get_or_create(child=child)
            balance.available_minutes = random.choice([300, 600, 900, 1200, 1800, 2400])
            balance.save()
            
            self.stdout.write(self.style.SUCCESS(f"Child {child.full_name} set up with balance: {balance.available_minutes} mins."))

        # 4. Links Setup (Parent -> Children)
        # Shared Child: Valentina Gómez belongs to Carlos Gómez (Index 0) and Ana Gómez (Index 5)
        shared_child = children[0]
        shared_child.parent_profiles.add(parent_profiles[0]) # Carlos (Dad)
        shared_child.parent_profiles.add(parent_profiles[5]) # Ana (Mom)
        self.stdout.write(self.style.SUCCESS(f"Linked shared child Valentina Gómez to Carlos and Ana."))

        # Mateo Gómez (Index 1) belongs to Carlos Gómez (Index 0) and Ana Gómez (Index 5) as well
        children[1].parent_profiles.add(parent_profiles[0])
        children[1].parent_profiles.add(parent_profiles[5])

        # Link other children to remaining parents (Index 1 to 4 are Dads, Index 6 to 9 are Moms)
        # Pedro Martínez (Index 1) -> Sofía Martínez (Index 2), Santiago Martínez (Index 3)
        children[2].parent_profiles.add(parent_profiles[1])
        children[3].parent_profiles.add(parent_profiles[1])

        # Luis Hernández (Index 2) -> Camila Hernández (Index 4), Lucas Hernández (Index 5)
        children[4].parent_profiles.add(parent_profiles[2])
        children[5].parent_profiles.add(parent_profiles[2])

        # Jorge Díaz (Index 3) -> Isabella Díaz (Index 6)
        children[6].parent_profiles.add(parent_profiles[3])

        # Juan Pérez (Index 4) -> Daniel Pérez (Index 7)
        children[7].parent_profiles.add(parent_profiles[4])

        # María Rodríguez (Index 6) -> Martina Rodríguez (Index 8), Sebastián Rodríguez (Index 9)
        children[8].parent_profiles.add(parent_profiles[6])
        children[9].parent_profiles.add(parent_profiles[6])

        # Lucía Sánchez (Index 7) -> Luciana Sánchez (Index 10), Enzo Sánchez (Index 11)
        children[10].parent_profiles.add(parent_profiles[7])
        children[11].parent_profiles.add(parent_profiles[7])

        # Elena Castro (Index 8) -> Julieta Castro (Index 12)
        children[12].parent_profiles.add(parent_profiles[8])

        # Sofía Ramírez (Index 9) -> Matías Ramírez (Index 13), Alejandro Ramírez (Index 14)
        children[13].parent_profiles.add(parent_profiles[9])
        children[14].parent_profiles.add(parent_profiles[9])

        self.stdout.write(self.style.SUCCESS("All parents and children linked correctly."))
        self.stdout.write(self.style.SUCCESS("Database seeding completed successfully!"))
