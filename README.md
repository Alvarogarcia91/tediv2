# TEDI Platform Bootstrap

This is the initial technical bootstrap for the TEDI platform.

## Architecture Stack

* **Backend**: Python 3.11 + Django + Django REST Framework
* **Frontend**: Next.js + TypeScript
* **Database**: PostgreSQL 15
* **Docker Compose**: Orchestrates all services for local development.

---

## Quick Start

1. **Copy environment template**:
   ```bash
   cp .env.example .env
   ```

2. **Run the services**:
   ```bash
   docker compose up --build
   ```

3. **Check health status**:
   - Backend health API: [http://localhost:8000/api/health/](http://localhost:8000/api/health/)
   - Next.js web application: [http://localhost:3000/](http://localhost:3000/)
   - Django admin dashboard: [http://localhost:8000/admin/](http://localhost:8000/admin/)

---

## Dev Superuser Credentials

* **Username**: `alvaro.garcia`
* **Email**: `alvaro.garcia@itnexora.com`
* **Password**: `Tedi123#`

See the files under the `docs/` folder for detailed design reviews and setup details.