#!/bin/bash

# Sports Prophecy Arena - Disaster Recovery Backup Script
# Run this script periodically to back up your database and codebase.

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="$(pwd)/backups/$TIMESTAMP"

echo "🛡️  Starting Sports Prophecy Arena Backup... ($TIMESTAMP)"

# Create backup directory
mkdir -p "$BACKUP_DIR"

# 1. Database Backup
# Extract DATABASE_URL from .env
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi

if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL not found in .env"
    exit 1
fi

echo "📦 Dumping database to $BACKUP_DIR/database.sql..."
if command -v pg_dump &> /dev/null; then
    pg_dump "$DATABASE_URL" > "$BACKUP_DIR/database.sql"
    if [ $? -eq 0 ]; then
        echo "✅ Database backup successful."
    else
        echo "❌ Database backup failed."
    fi
else
    echo "⚠️  'pg_dump' not found. Please install PostgreSQL client tools to back up the database."
    echo "   On Mac: brew install postgresql"
fi

# 2. Codebase Backup
echo "🗜️  Zipping codebase..."
# Move up to root directory to zip frontend and backend
cd ..
zip -r "backend/backups/$TIMESTAMP/codebase.zip" frontend backend -x "*/node_modules/*" -x "*/.next/*" -x "*/dist/*" -x "*/.git/*" > /dev/null

if [ $? -eq 0 ]; then
    echo "✅ Codebase backup successful."
else
    echo "❌ Codebase backup failed."
fi

echo "🎉 Backup complete! Your files are safely stored in: backend/backups/$TIMESTAMP"
