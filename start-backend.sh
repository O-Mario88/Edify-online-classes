#!/bin/bash

# Edify Backend Startup Script

echo "🚀 Starting Edify Backend..."

# Navigate to backend directory
cd "$(dirname "$0")/edify_backend"

# Activate virtual environment
source venv/bin/activate

# Local dev defaults. settings.py treats DEBUG as false unless explicitly set —
# this keeps prod safe by construction. Local runs opt in here.
export DJANGO_DEBUG="${DJANGO_DEBUG:-true}"

# Run migrations (safe - only applies pending ones)
echo "📦 Running database migrations..."
python manage.py migrate

# Start development server
echo "✅ Backend starting on http://localhost:8000"
echo "📝 API docs available at http://localhost:8000/api/v1/"
echo ""
python manage.py runserver
