#!/bin/bash

# Deployment script for Kimi Chat Application
# This script will deploy the application to Vercel

echo "🚀 Starting deployment process..."

# Check if user is logged in to Vercel
echo "📋 Checking Vercel authentication..."
if ! vercel whoami > /dev/null 2>&1; then
    echo "❌ You need to login to Vercel first."
    echo "Please run: vercel login"
    echo "Then run this script again."
    exit 1
fi

echo "✅ Vercel authentication confirmed"

# Build the project
echo "🔨 Building the project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix the errors and try again."
    exit 1
fi

echo "✅ Build completed successfully"

# Deploy to Vercel
echo "🌐 Deploying to Vercel..."
vercel --prod

if [ $? -eq 0 ]; then
    echo "🎉 Deployment completed successfully!"
    echo "📝 Don't forget to set your environment variables in Vercel dashboard:"
    echo "   - GROQ_API_KEY: Your Groq API key"
    echo "🔗 Visit your Vercel dashboard to get the deployment URL"
else
    echo "❌ Deployment failed. Please check the error messages above."
    exit 1
fi