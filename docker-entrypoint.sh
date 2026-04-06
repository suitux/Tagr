#!/bin/sh
set -e

PUID=${PUID:-1000}
PGID=${PGID:-1000}

# Reuse existing group with that GID or create a new one
GROUP_NAME=$(getent group "$PGID" | cut -d: -f1)
if [ -z "$GROUP_NAME" ]; then
  groupadd -g "$PGID" tagr
  GROUP_NAME=tagr
fi

# Reuse existing user with that UID or create a new one
USER_NAME=$(getent passwd "$PUID" | cut -d: -f1)
if [ -z "$USER_NAME" ]; then
  useradd -u "$PUID" -g "$GROUP_NAME" -d /app -M -s /bin/sh tagr
  USER_NAME=tagr
fi

# Adjust ownership of data and app directories
chown -R "$USER_NAME":"$GROUP_NAME" /data
chown -R "$USER_NAME":"$GROUP_NAME" /app

# Resolve DATABASE_URL to a file path for SQLite checks
DB_PATH=$(echo "$DATABASE_URL" | sed 's|^file:||')

# Baseline existing databases created by "db push" (pre-migration era).
# If the DB file exists with tables but no _prisma_migrations table,
# mark the init migration as already applied so migrate deploy doesn't fail.
if [ -f "$DB_PATH" ]; then
  HAS_MIGRATIONS_TABLE=$(sqlite3 "$DB_PATH" "SELECT name FROM sqlite_master WHERE type='table' AND name='_prisma_migrations';" 2>/dev/null || true)
  if [ -z "$HAS_MIGRATIONS_TABLE" ]; then
    echo "Existing database detected without migration history. Baselining..."
    su-exec "$USER_NAME" npx prisma migrate resolve --applied "20260223143441_init" --config ./prisma.config.ts
  fi
fi

# Apply pending database migrations on startup
echo "Running prisma migrate deploy..."
su-exec "$USER_NAME" npx prisma migrate deploy --config ./prisma.config.ts

# Start Next.js server
exec su-exec "$USER_NAME" node server.js
