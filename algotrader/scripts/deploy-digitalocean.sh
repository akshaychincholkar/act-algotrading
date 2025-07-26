#!/bin/bash

# AlgoTrading DigitalOcean Deployment Script
set -e

echo "🌊 Deploying to DigitalOcean App Platform..."

# Check if doctl is installed
if ! command -v doctl &> /dev/null; then
    echo "❌ DigitalOcean CLI (doctl) not found. Please install it first."
    echo "   Visit: https://docs.digitalocean.com/reference/doctl/how-to/install/"
    exit 1
fi

# Check authentication
echo "🔐 Checking DigitalOcean authentication..."
doctl auth list || doctl auth init

# Create or update app
if [ -f ".do/app.yaml" ]; then
    echo "🚀 Deploying app..."
    doctl apps create --spec .do/app.yaml
else
    echo "❌ .do/app.yaml not found!"
    exit 1
fi

echo "✅ DigitalOcean deployment completed!"
echo "🌐 Check your DigitalOcean dashboard for app status:"
echo "   https://cloud.digitalocean.com/apps"
