# syntax=docker.io/docker/dockerfile:1

FROM node:22-alpine AS base

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY patches ./patches
COPY prisma ./prisma
RUN pnpm install --frozen-lockfile
RUN pnpm run prisma-generate-client

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/src/generated ./src/generated
COPY . .

# Set environment variables for build
ENV NEXT_TELEMETRY_DISABLED=1

RUN pnpm build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Install su-exec for lightweight user switching (LSIO pattern)
RUN apk add --no-cache su-exec

# Create data and music directories (ownership set at runtime by entrypoint)
RUN mkdir -p /data /music

COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Prisma: copy schema + config, install CLI for db push & studio at runtime
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
RUN npm install -g prisma@7.4.0 dotenv@17.3.1 && \
    mkdir -p node_modules && \
    ln -s /usr/local/lib/node_modules/prisma node_modules/prisma && \
    ln -s /usr/local/lib/node_modules/dotenv node_modules/dotenv

# Entrypoint script
COPY docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x docker-entrypoint.sh

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["./docker-entrypoint.sh"]

