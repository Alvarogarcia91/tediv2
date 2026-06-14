# TEDI Platform

This repository contains the technical bootstrap, authentication system, parents & children module, and billing system for the TEDI platform.

## Architecture Stack

* **Backend**: Python 3.11 + Django + Django REST Framework (DRF)
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
   *(If upgrading from a previous checkpoint, reset volumes using `docker compose down -v` first)*.

3. **Open the Login page**:
   Go to [http://localhost:3000/login](http://localhost:3000/login)

---

## Development Credentials

### Admin Superuser
* **Username**: `alvaro.garcia`
* **Email**: `alvaro.garcia@itnexora.com`
* **Password**: `Tedi123#`
* **Assigned Role**: `super_admin`

### Parent Demo User
* **Username**: `maria.garcia`
* **Email**: `maria.garcia@example.com`
* **Password**: `Tedi123#`
* **Assigned Role**: `parent`

---

## Endpoints Created

### Authentication
* **Health API**: GET `/api/health/`
* **CSRF Token API**: GET `/api/auth/csrf/`
* **Login API**: POST `/api/auth/login/`
* **Logout API**: POST `/api/auth/logout/`
* **Profile Info API**: GET `/api/auth/me/`

### Children & Parents
* **Parent Profiles**:
  - GET `/api/children/parents/`
  - POST `/api/children/parents/`
  - GET `/api/children/parents/{id}/`
  - PATCH `/api/children/parents/{id}/`
* **Children**:
  - GET `/api/children/children/`
  - POST `/api/children/children/`
  - GET `/api/children/children/{id}/`
  - PATCH `/api/children/children/{id}/`

### Billing
* **Hour Packages**:
  - GET `/api/billing/packages/`
  - POST `/api/billing/packages/`
  - GET `/api/billing/packages/{id}/`
  - PATCH `/api/billing/packages/{id}/`
* **Child Hour Balances**:
  - GET `/api/billing/balances/`
  - GET `/api/billing/balances/{id}/`
* **Hour Purchases**:
  - GET `/api/billing/purchases/`
  - POST `/api/billing/purchases/`
  - GET `/api/billing/purchases/{id}/`
  - PATCH `/api/billing/purchases/{id}/`

* **Django Admin**: [http://localhost:8000/admin/](http://localhost:8000/admin/)