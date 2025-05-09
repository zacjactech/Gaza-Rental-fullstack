#!/bin/bash

# Gaza-Rental-Website Deployment Script

echo "🚀 Starting deployment process for Gaza-Rental-Website..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Check environment variables
echo "🔍 Checking environment variables..."
npm run check-env
if [ $? -ne 0 ]; then
    echo "❌ Environment check failed. Please fix the issues before deploying."
    exit 1
fi

# Check for uncommitted changes
if [ -d ".git" ] && [ -n "$(git status --porcelain)" ]; then
    echo "⚠️ You have uncommitted changes. Commit them before deploying? (y/n)"
    read answer
    if [ "$answer" = "y" ]; then
        echo "Enter commit message:"
        read message
        git add .
        git commit -m "$message"
    fi
fi

# Set environment to production
export NODE_ENV=production

# Build the project
echo "🔨 Building project..."
npm run build

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment complete! Check your Vercel dashboard for details." 