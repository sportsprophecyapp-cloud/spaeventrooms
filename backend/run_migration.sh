#!/bin/bash
# Run database migrations on Render
# This script should be run manually or via Render's shell

echo "Running sponsor_analytics table migration..."
psql $DATABASE_URL -f migrations/add_sponsor_analytics_table.sql

echo "Migration complete!"
