#!/bin/bash

# AlgoTrading Application Deployment Script
# This script helps deploy the application using Docker Compose

set -e

echo "🚀 Starting AlgoTrading Application Deployment..."

# Check if Docker and Docker Compose are installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from template..."
    cp .env.example .env
    echo "📝 Please update the .env file with your actual configuration values."
    echo "   Edit .env file and run this script again."
    exit 1
fi

# Build and start the application
echo "🔨 Building Docker images..."
docker-compose build

echo "🗄️  Starting database and Redis..."
docker-compose up -d db redis

echo "⏳ Waiting for database to be ready..."
sleep 10

echo "🔄 Running database migrations..."
docker-compose run --rm backend python manage.py migrate

echo "👤 Creating superuser (optional)..."
echo "You can create a Django superuser by running:"
echo "docker-compose run --rm backend python manage.py createsuperuser"

echo "📦 Collecting static files..."
docker-compose run --rm backend python manage.py collectstatic --noinput

echo "🚀 Starting all services..."
docker-compose up -d

echo "✅ Deployment completed successfully!"
echo ""
echo "🌐 Application URLs:"
echo "   Frontend: http://localhost"
echo "   Backend API: http://localhost:8000"
echo "   Admin Panel: http://localhost:8000/admin"
echo ""
echo "📊 To view logs, run:"
echo "   docker-compose logs -f"
echo ""
echo "🛑 To stop the application, run:"
echo "   docker-compose down"
echo ""
echo "🔧 To restart the application, run:"
echo "   docker-compose restart"
