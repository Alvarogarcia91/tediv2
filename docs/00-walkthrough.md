# walkthrough.md - TEDI Technical Bootstrap, Children, & Billing Modules

This document details what was built for TEDI, focusing on the parents-children module and the billing system.

## Billing Module (`billing/`)

### Database Models

1. **`HourPackage`**:
   - Stores pre-configured hour packages (e.g. 5 hours, 10 hours, 20 hours).
   - Fields: `name`, `description`, `hours`, `price`, `is_active`, `sort_order`.
   - Property: `minutes` (computes total minutes: `hours * 60`).

2. **`ChildHourBalance`**:
   - Manages hour balances for each child.
   - Fields: `child` (OneToOneField), `available_minutes`, `total_purchased_minutes`, `total_consumed_minutes`.
   - Methods:
     - `add_purchased_minutes(minutes)`: Atomically adds minutes to available and purchased counters.
     - `consume_minutes(minutes)`: Validates and deducts minutes. Avoids negative balances.

3. **`HourPurchase`**:
   - Tracks package purchases.
   - Fields: `child`, `package` (SET_NULL), `purchased_minutes`, `amount`, `payment_status` (pending, paid, cancelled), `payment_method`, `payment_reference`, `_balance_credited`.
   - Automatically populates `purchased_minutes` and `amount` from the linked `HourPackage` if they are omitted.

### Double-Credit Protection
- When an `HourPurchase` is saved, if `payment_status` is `paid` AND `_balance_credited` is `False`, the purchase credits the `purchased_minutes` to the child's `ChildHourBalance` and sets `_balance_credited` to `True`.
- This operation is performed inside a database transaction (`transaction.atomic`) using `select_for_update` to avoid race conditions.
- The `_balance_credited` flag is checked first, meaning subsequent edits to the purchase (e.g. updating notes) will never credit the child's balance a second time.

### Demo Seeding command (`seed_demo_billing`)
- Seeds three standard packages (5 hours, 10 hours, 20 hours).
- Creates a paid purchase (`DEMO-CASH-001`) of 10 hours (600 minutes) for "Sofía García".
- Ensures that running the command multiple times keeps Sofía's balance at exactly 600 minutes.

---

## How to Test and Validate Without a Browser

1. Start docker compose: `docker compose up --build`.
2. Run Django shell assertions:
   ```bash
   docker compose exec backend python manage.py shell -c "
   from billing.models import HourPackage, HourPurchase, ChildHourBalance
   from children.models import Child
   assert HourPackage.objects.all().count() == 3
   sofia = Child.objects.get(first_name='Sofía', last_name='García')
   balance = ChildHourBalance.objects.get(child=sofia)
   assert balance.available_minutes == 600
   purchase = HourPurchase.objects.get(payment_reference='DEMO-CASH-001')
   assert purchase._balance_credited is True
   print('Billing validation succeeded!')
   "
   ```
3. Run API endpoint checks:
   - Call `/api/billing/packages/` or `/api/billing/balances/` using testing tools.
4. Verify Next.js compiles the `/billing` route:
   - Run `docker logs tedi_frontend` to check that Next.js dev server compiles `/billing` to `200 OK` on access.
