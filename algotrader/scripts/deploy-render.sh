#!/bin/bash

# AlgoTrading Render.com Deployment Script
set -e

echo "🎨 Deploying AlgoTrading to Render.com..."

# Check if render.yaml exists
if [ ! -f "render.yaml" ]; then
    echo "❌ render.yaml not found!"
    exit 1
fi

# Check if git repository is clean
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  You have uncommitted changes. Committing them..."
    git add .
    git commit -m "Deploy to Render: $(date)"
fi

# Update environment files for production
echo "🔧 Setting up production environment..."
echo "VITE_API_URL=https://algotrading-backend.onrender.com" > frontend/.env.production
echo "VITE_FRONTEND_URL=https://algotrading-frontend.onrender.com" >> frontend/.env.production
echo "VITE_NODE_ENV=production" >> frontend/.env.production
echo "VITE_DEBUG=false" >> frontend/.env.production

# Push to git repository (Render auto-deploys from git)
echo "📤 Pushing to git repository..."
git push origin main

echo "✅ Render deployment initiated!"
echo ""
echo "🌐 Your services will be available at:"
echo "   Frontend: https://algotrading-frontend.onrender.com"
echo "   Backend: https://algotrading-backend.onrender.com"
echo ""
echo "📊 Monitor deployment status at:"
echo "   https://dashboard.render.com/"
echo ""
echo "⏱️  Note: Free tier services may take 1-2 minutes to start from sleep."
echo "💡 Tip: Keep your app active with a simple ping service to avoid cold starts."
