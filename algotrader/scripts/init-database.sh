#!/bin/bash

# SQLite Database Initialization Script
# This script sets up the SQLite database for the AlgoTrading application

set -e

echo "🗄️  Initializing SQLite Database..."

# Navigate to backend directory
cd backend

# Check if SQLite database exists
if [ -f "db.sqlite3" ]; then
    echo "📋 SQLite database already exists."
    echo "   Location: $(pwd)/db.sqlite3"
    echo "   Size: $(du -h db.sqlite3 | cut -f1)"
else
    echo "🆕 Creating new SQLite database..."
fi

# Run Django migrations
echo "🔄 Running database migrations..."
python manage.py makemigrations
python manage.py migrate

# Create superuser (optional)
echo "👤 Creating superuser..."
echo "You can create a Django superuser by running:"
echo "python manage.py createsuperuser"

# Collect static files
echo "📦 Collecting static files..."
python manage.py collectstatic --noinput

echo "✅ SQLite database initialization completed!"
echo ""
echo "📊 Database Information:"
echo "   Type: SQLite"
echo "   Location: $(pwd)/db.sqlite3"
if [ -f "db.sqlite3" ]; then
    echo "   Size: $(du -h db.sqlite3 | cut -f1)"
fi
echo ""
echo "🚀 You can now start your Django development server:"
echo "   python manage.py runserver"
