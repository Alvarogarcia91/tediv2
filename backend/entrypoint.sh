#!/bin/sh

# Exit immediately if a command exits with a non-zero status
set -e

echo "Waiting for PostgreSQL database..."
python -c "
import sys
import time
import psycopg2
import os

host = os.environ.get('DATABASE_HOST', 'db')
port = os.environ.get('DATABASE_PORT', '5432')
dbname = os.environ.get('POSTGRES_DB', 'tedi_db')
user = os.environ.get('POSTGRES_USER', 'tedi_user')
password = os.environ.get('POSTGRES_PASSWORD', 'tedi123#')

for i in range(30):
    try:
        conn = psycopg2.connect(
            host=host,
            port=port,
            dbname=dbname,
            user=user,
            password=password
        )
        conn.close()
        print('PostgreSQL is up and running!')
        sys.exit(0)
    except psycopg2.OperationalError as e:
        print(f'Database not ready yet (attempt {i+1}/30)...')
        time.sleep(1)
print('Error: Database connection timed out.')
sys.exit(1)
"

echo "Applying database migrations..."
python manage.py migrate --noinput

echo "Seeding initial roles/groups..."
python manage.py seed_roles

echo "Creating default superuser if it doesn't exist..."
python manage.py create_default_superuser

echo "Seeding demo children and parents data..."
python manage.py seed_demo_children

echo "Starting Django development server..."
exec python manage.py runserver 0.0.0.0:8000
