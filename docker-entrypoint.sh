#!/bin/sh
set -e

PUID=${PUID:-1000}
PGID=${PGID:-1000}

# Reuse existing group with that GID or create a new one
GROUP_NAME=$(getent group "$PGID" | cut -d: -f1)
if [ -z "$GROUP_NAME" ]; then
  addgroup -g "$PGID" tagr
  GROUP_NAME=tagr
fi

# Reuse existing user with that UID or create a new one
USER_NAME=$(getent passwd "$PUID" | cut -d: -f1)
if [ -z "$USER_NAME" ]; then
  adduser -D -u "$PUID" -G "$GROUP_NAME" -h /app tagr
  USER_NAME=tagr
fi

# Adjust ownership of data and app directories
chown -R "$USER_NAME":"$GROUP_NAME" /data
chown -R "$USER_NAME":"$GROUP_NAME" /app

# Create/migrate database schema on startup
echo "Running prisma db push..."
su-exec "$USER_NAME" npx prisma db push --config ./prisma.config.ts

# Start Next.js server
exec su-exec "$USER_NAME" node server.js
