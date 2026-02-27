#!/bin/sh
set -e

# Create/migrate database schema on startup
echo "Running prisma db push..."
npx prisma db push --config ./prisma.config.ts

# Start Next.js server
exec node server.js
