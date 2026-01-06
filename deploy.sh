#!/bin/bash

# Sports Prophecy One-Click Deploy
# Usage: ./deploy.sh "your commit message"

if [ -z "$1" ]
  then
    echo "❌ Please provide a commit message."
    echo "Usage: ./deploy.sh \"your message\""
    exit 1
fi

echo "🚀 Starting Deployment..."

# Stage all changes
git add .

# Commit with the provided message
git commit -m "$1"

# Push to origin main
git push origin main

echo "✅ Pushed to GitHub. Render will now start the build."
