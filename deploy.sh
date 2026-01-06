#!/bin/bash

# Sports Prophecy Pro Deploy System
# Usage: ./deploy.sh "message"

# 1. Check if we are in the root folder
if [ ! -d ".git" ]; then
  echo "❌ Error: Please run this from the project root folder."
  exit 1
fi

# 2. Check for commit message
if [ -z "$1" ]; then
  echo "❌ Error: Missing commit message."
  echo "Usage: ./deploy.sh \"your message\""
  exit 1
fi

echo "---------------------------------------"
echo "🚀 PREPARING DEPLOYMENT..."
echo "---------------------------------------"

# 3. Stage and Commit
git add .
git commit -m "$1"

# 4. Push to Production (Render)
echo "📡 Pushing to GitHub..."
git push origin main

if [ $? -eq 0 ]; then
  echo "---------------------------------------"
  echo "✅ DEPLOY SUCCESSFUL!"
  echo "🚀 Render is now building your updates."
  echo "🔗 URL: https://www.sportsprophecyapp.com"
  echo "---------------------------------------"
else
  echo "❌ Deployment failed. Check your internet or git permissions."
fi
