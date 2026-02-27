#!/bin/sh
set -e

# Create/migrate database schema on startup
echo "Running prisma db push..."
npx prisma db push --config ./prisma.config.ts

# Start Prisma Studio in background on port 5555
npx prisma studio --port 5555 --browser none &

# Start Next.js server
exec node server.js
