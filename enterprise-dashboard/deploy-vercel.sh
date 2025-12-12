#!/bin/bash

# Hotel Management System - Vercel Deployment Script
# This script helps deploy the frontend to Vercel

set -e

echo "================================================"
echo "   HOTEL MANAGEMENT - VERCEL DEPLOYMENT"
echo "================================================"
echo ""

# Navigate to frontend directory
cd "$(dirname "$0")"

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI is not installed."
    echo "📦 Installing Vercel CLI globally..."
    npm install -g vercel
fi

echo "✅ Vercel CLI found"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
else
    echo "✅ Dependencies already installed"
fi

echo ""
echo "🔐 Please login to Vercel (if not already logged in):"
vercel login

echo ""
echo "🚀 Deploying to Vercel..."
echo ""
echo "Choose deployment type:"
echo "1) Preview deployment (test)"
echo "2) Production deployment"
echo ""
read -p "Enter choice (1 or 2): " choice

case $choice in
    1)
        echo "📤 Starting preview deployment..."
        vercel
        ;;
    2)
        echo "📤 Starting production deployment..."
        vercel --prod
        ;;
    *)
        echo "❌ Invalid choice. Exiting."
        exit 1
        ;;
esac

echo ""
echo "================================================"
echo "   ✅ DEPLOYMENT COMPLETE!"
echo "================================================"
echo ""
echo "📝 Next Steps:"
echo "1. Configure your backend API URL in Vercel settings"
echo "2. Add environment variables in Vercel dashboard"
echo "3. Test the deployed application"
echo "4. Deploy backend services separately"
echo ""
echo "📚 See DEPLOYMENT.md for detailed instructions"
echo ""
