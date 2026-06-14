# walkthrough.md - TEDI Technical Bootstrap & Parents-Children Module

This document details what was built for TEDI, focusing on the parents and children module.

## What was added

1. **New App `children`**:
   - Handles the profiling of parent users and children.
   - Restricts view access at the database level so parent users only see their own kids, while admins/staff can see all.

2. **Database Models**:
   - `TimestampMixin` (abstract model for `created_at` and `updated_at` fields).
   - `ParentProfile`: Extends the core `User` model via a OneToOne relationship. Stores additional contact/emergency info.
   - `Child`: Many-to-many relationship with `ParentProfile`. Generates unique alphanumeric codes, and computes child age.

3. **Data Relationships**:
   - `User` (1-to-1) -> `ParentProfile` (many-to-many) -> `Child`
   - Enables multiple parent/guardian accounts to be linked to the same child.

4. **Unique Code Generation**:
   - Inside `Child.save()`, if `unique_code` is left blank, a helper method generates a unique 6-character alphanumeric string. It checks database records recursively to ensure no duplicates.

5. **Demo Seeding command (`seed_demo_children`)**:
   - Creates parent user `maria.garcia` (role: `parent`).
   - Generates Maria's parent profile.
   - Creates children Sofía García and Mateo García linked to Maria.
   - Designed to run idempotently: repeats updates existing records without duplication.

---

## How to Test and Validate Without a Browser

1. Start docker compose: `docker compose up --build`.
2. Run Django shell assertions:
   ```bash
   docker compose exec backend python manage.py shell -c "
   from django.contrib.auth import get_user_model
   from children.models import ParentProfile, Child
   u = get_user_model().objects.get(username='maria.garcia')
   p = ParentProfile.objects.get(user=u)
   assert p.children.count() == 2
   print('Validation Succeeded!')
   "
   ```
3. Run API endpoint checks:
   - Call `/api/children/children/` using the Django rest test factory (verified internally during testing).
   - Confirm unauthenticated queries receive a `403 Forbidden` response.
4. Verify Next.js compiles the `/children` route:
   - Run `docker logs tedi_frontend` to check that Next.js dev server compiles `/children` to `200 OK` on access.
