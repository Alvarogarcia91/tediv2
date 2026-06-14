# Setup Guide - TEDI

Step-by-step instructions to boot the development environment from scratch.

## Prerequisites

1. **Docker & Docker Compose**: Ensure Docker Desktop is installed and running.
2. **Git**: To version control changes.

---

## Setup Instructions

1. **Clone the repository**:
   ```bash
   git clone <repository_url>
   cd tediv2
   ```

2. **Prepare Environment Variables**:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   *(On Windows PowerShell: `Copy-Item .env.example .env`)*

3. **Start the Environment**:
   Run the following command to build and launch the containers:
   ```bash
   docker compose up --build
   ```

4. **Verify the Services**:
   - Backend health endpoint: [http://localhost:8000/api/health/](http://localhost:8000/api/health/)
   - Frontend app: [http://localhost:3000](http://localhost:3000)
   - Django Admin dashboard: [http://localhost:8000/admin/](http://localhost:8000/admin/) (credentials in `.env`)
