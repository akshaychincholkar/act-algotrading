#!/bin/bash

# AlgoTrading Universal Production Deployment Script
set -e

echo "🚀 AlgoTrading Production Deployment"
echo "====================================="

# Function to display menu
show_menu() {
    echo ""
    echo "Select deployment platform:"
    echo "1) Railway.app (Recommended)"
    echo "2) Render.com"
    echo "3) DigitalOcean App Platform"
    echo "4) Local Docker Production"
    echo "5) Exit"
    echo ""
}

# Function to deploy to Railway
deploy_railway() {
    echo "🚂 Starting Railway deployment..."
    ./scripts/deploy-railway.sh
}

# Function to deploy to Render
deploy_render() {
    echo "🎨 Starting Render deployment..."
    ./scripts/deploy-render.sh
}

# Function to deploy to DigitalOcean
deploy_digitalocean() {
    echo "🌊 Starting DigitalOcean deployment..."
    ./scripts/deploy-digitalocean.sh
}

# Function to run local production
deploy_local() {
    echo "🐳 Starting local production deployment..."
    
    # Check if .env.prod exists
    if [ ! -f ".env.prod" ]; then
        echo "⚠️  .env.prod not found. Creating from template..."
        cp .env.example .env.prod
        echo "📝 Please update .env.prod with production values and run again."
        exit 1
    fi
    
    # Build and start production containers
    docker-compose -f docker-compose.prod.yml --env-file .env.prod up --build -d
    
    echo "✅ Local production deployment completed!"
    echo "🌐 Frontend: http://localhost"
    echo "🔗 Backend: http://localhost:8000"
}

# Main menu loop
while true; do
    show_menu
    read -p "Enter your choice (1-5): " choice
    
    case $choice in
        1)
            deploy_railway
            break
            ;;
        2)
            deploy_render
            break
            ;;
        3)
            deploy_digitalocean
            break
            ;;
        4)
            deploy_local
            break
            ;;
        5)
            echo "👋 Goodbye!"
            exit 0
            ;;
        *)
            echo "❌ Invalid option. Please try again."
            ;;
    esac
done

echo ""
echo "🎉 Deployment process completed!"
echo "📊 Monitor your application and check logs regularly."
