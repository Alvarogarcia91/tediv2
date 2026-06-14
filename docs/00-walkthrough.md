# walkthrough.md - TEDI Technical Bootstrap

This document details what was built for the technical bootstrap of TEDI, the design choices made, and how components interact.

## What was created

1. **Docker Compose Environment**:
   - `db` service: PostgreSQL database (`postgres:15-alpine`).
   - `backend` service: Python 3.11/Django REST Framework container with hot-reloading bind mounts.
   - `frontend` service: Next.js/TypeScript App Router container with hot-reloading bind mounts.

2. **Django Backend (`backend/`)**:
   - Organized as a Django project named `tedi` with a core application `core`.
   - Django REST Framework configured for API responses.
   - `django-cors-headers` configured to permit local development access from `http://localhost:3000`.
   - `/api/health/` GET endpoint that checks service availability.

3. **Idempotent Superuser Command**:
   - A custom management command `create_dev_superuser` located in `core/management/commands/`.
   - Checks if the user exists. If not, it creates them. If they exist, it updates their email and password based on environmental settings.
   - Runs automatically on Docker startup via the `entrypoint.sh` wrapper.

4. **Next.js Frontend (`frontend/`)**:
   - Built with Next.js 14, App Router, and TypeScript.
   - Homepage checking backend health asynchronously via `fetch` from the client.

---

## Design Choices & Rationale

- **Environment variables**: Decoupled environment configs (`.env` and `.env.example`) so passwords and keys are not hardcoded.
- **Wait-for-DB Python check**: Avoids installing additional binaries inside the container like `nc` or `wait-for-it.sh`. An inline Python script using `psycopg2` tests the database connection until it's ready.
- **Node Modules Volume**: Set up `node_modules` volume in `docker-compose.yml` to prevent local `node_modules` overrides from conflicts between the host OS and the Linux container.

---

## How to Test

1. Ensure Docker Desktop is running.
2. Run `docker compose up --build`.
3. Visit `http://localhost:3000` to verify the frontend status and connection to the backend.
4. Visit `http://localhost:8000/admin/` and log in using the credentials:
   - **Username**: `alvaro.garcia`
   - **Password**: `Tedi123#`
