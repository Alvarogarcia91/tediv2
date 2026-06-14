# walkthrough.md - TEDI Technical Bootstrap & Authentication

This document details what was built for the technical bootstrap of TEDI, focusing on the authentication layer and role management.

## What was created

1. **Custom User Model (`accounts.User`)**:
   - Extends Django's `AbstractUser`.
   - Fields: `email` (unique), `username` (unique), `first_name`, `last_name`, `is_parent` (boolean default False), and `last_login_ip` (nullable IP address).
   - Configured in settings: `AUTH_USER_MODEL = 'accounts.User'`.

2. **Idempotent Seeding & Superuser Management**:
   - `seed_roles` management command: Creates Groups (`super_admin`, `admin`, `staff`, `parent`) if they don't exist.
   - `create_default_superuser` management command: Creates the developer superuser `alvaro.garcia`, makes them staff/superuser, and assigns them to the `super_admin` Group.
   - Entrypoint updates: The backend container runs `migrate`, `seed_roles`, and `create_default_superuser` in sequence on startup.

3. **Session Authentication & CSRF Protection**:
   - Django Session Authentication configured in DRF settings.
   - Endpoint GET `/api/auth/csrf/` to set the `csrftoken` cookie.
   - Endpoint POST `/api/auth/login/` for logging in, validating credentials, setting session data, and returning profile information.
   - Endpoint POST `/api/auth/logout/` for logging out.
   - Endpoint GET `/api/auth/me/` for retrieving profile details including assigned group roles.

4. **Next.js Pages**:
   - `/login` Page: Captures username & password, handles login flow using the `lib/auth.ts` helper library.
   - `/dashboard` Page: Validates authentication status via `/api/auth/me/`, renders profile roles, and supports logout.

---

## Technical Details

### Session Authentication & CSRF
- **Session Auth**: Django stores a session identifier in a cookie (`sessionid`) sent back in response headers during login. Subsequent requests automatically pass this cookie.
- **CSRF Protection**: For write requests (POST), Django checks for a CSRF token in the `X-CSRFToken` header. The frontend retrieves this token from the `csrftoken` cookie set by GET `/api/auth/csrf/` and sends it back in requests.
- **CORS/Credentials**: Next.js fetches are configured with `credentials: 'include'` to allow browsers to exchange session/CSRF cookies across ports (3000 to 8000).

---

## How to Test and Validate

1. Start docker compose: `docker compose up --build`.
2. Visit [http://localhost:3000/login](http://localhost:3000/login).
3. Authenticate with credentials:
   - Username: `alvaro.garcia`
   - Password: `Tedi123#`
4. Confirm redirection to `/dashboard` displaying user roles (shows `super_admin`).
5. Click "Logout" and confirm redirection back to `/login`.
