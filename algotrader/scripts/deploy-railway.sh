#!/bin/bash

# AlgoTrading Railway Deployment Script
set -e

echo "🚂 Deploying to Railway.app..."

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

# Login to Railway (if not already logged in)
echo "🔐 Checking Railway authentication..."
railway whoami || railway login

# Build and deploy
echo "🔨 Building application..."

# Deploy Backend
echo "🐍 Deploying Backend..."
railway up --service backend

# Deploy Frontend
echo "⚛️ Deploying Frontend..."
railway up --service frontend

# Check deployment status
echo "📊 Checking deployment status..."
railway status

echo "✅ Railway deployment completed!"
echo "🌐 Your application should be available at:"
railway domain
