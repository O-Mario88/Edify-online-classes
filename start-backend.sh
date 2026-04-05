#!/bin/bash

# Edify Backend Startup Script

echo "🚀 Starting Edify Backend..."

# Navigate to backend directory
cd "$(dirname "$0")/edify_backend"

# Activate virtual environment
source venv/bin/activate

# Run migrations (safe - only applies pending ones)
echo "📦 Running database migrations..."
python manage.py migrate

# Start development server
echo "✅ Backend starting on http://localhost:8000"
echo "📝 API docs available at http://localhost:8000/api/v1/"
echo ""
python manage.py runserver
