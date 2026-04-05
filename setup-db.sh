#!/bin/bash
# Non-interactive migration script

cd "$(dirname "$0")/edify_backend"
source venv/bin/activate

# Delete old database
rm -f db.sqlite3

# Create fresh migrations
echo "Creating migrations..."
python manage.py makemigrations --noinput

# Apply migrations
echo "Applying migrations..."
python manage.py migrate

echo "✅ Database setup complete"
