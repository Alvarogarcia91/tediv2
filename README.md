# TEDI Platform

This repository contains the technical bootstrap and base authentication system for the TEDI platform.

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

* **Username**: `alvaro.garcia`
* **Email**: `alvaro.garcia@itnexora.com`
* **Password**: `Tedi123#`
* **Assigned Role**: `super_admin`

---

## Endpoints Created

* **Health API**: GET `/api/health/`
* **CSRF Token API**: GET `/api/auth/csrf/`
* **Login API**: POST `/api/auth/login/`
* **Logout API**: POST `/api/auth/logout/`
* **Profile Info API**: GET `/api/auth/me/`
* **Django Admin**: [http://localhost:8000/admin/](http://localhost:8000/admin/)