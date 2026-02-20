# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Project Is

Metadater is a self-hosted music metadata editor web app. It scans local music folders, stores metadata in SQLite, and provides a three-panel UI (folder tree / song list / metadata editor) for browsing and editing audio file tags.

## Commands

```bash
pnpm dev                      # Start development server
pnpm build                    # Production build
pnpm lint                     # Run ESLint
pnpm prisma-studio            # Open Prisma Studio GUI
pnpm prisma-recreate-db       # Reset database (force)
pnpm prisma-generate-client   # Regenerate Prisma client
pnpm generate-hash            # Hash a password for AUTH_PASSWORD env var
```

No test runner is configured.

## Environment Variables

Required in `.env`:
```
DATABASE_URL=file:./data/metadater.db
AUTH_SECRET="..."
AUTH_USER="admin"
AUTH_PASSWORD="$2b$12$..."   # bcrypt hash - generate with pnpm generate-hash
MUSIC_FOLDERS="/path/to/music"
```

## Architecture

**Stack:** Next.js 16 App Router, React 19, TypeScript, Prisma 7 + LibSQL (SQLite), NextAuth 5, TanStack React Query, Shadcn UI / Tailwind CSS 4, Axios, node-taglib-sharp (metadata writing), music-metadata (extraction).

### Request Flow

```
Browser (React Query) → /api/* route handlers → Prisma → SQLite (./data/metadater.db)
                                               ↓
                                     node-taglib-sharp → audio files on disk
```

### Key Directories

- `src/app/api/` — All backend logic lives here as Next.js route handlers
  - `scan/` — Scans MUSIC_FOLDERS, extracts metadata, upserts to DB
  - `songs/[[...path]]/` — Songs in a folder (GET)
  - `songs/[id]/` — Single song (GET) and metadata update (PATCH)
  - `folders/[[...name]]/` — Folder tree navigation
- `src/features/` — Domain layer: types (`domain.ts`) + React Query hooks per feature (songs, folders, scan)
- `src/lib/db/` — Database utilities: `client.ts` (Prisma singleton), `scanner.ts` (file traversal + metadata extraction), `metadata-writer.ts` (writes tags back to files), `optimize.ts` (SQLite PRAGMAs: WAL, 256MB cache)
- `src/components/panels/` — The three UI panels: `folder-list/`, `main-content/`, `detail-panel/`
- `src/lib/song-file-helpers.ts` — Reads MUSIC_FOLDERS env var
- `src/auth.ts` — NextAuth credentials provider config

### Data Model (prisma/schema.prisma)

Three models: `Song` (main entity with all common audio tags + file info), `SongMetadata` (key-value pairs for extended/native tags), `SongPicture` (album art blobs). Indexes on `folderPath`, `artist`, `album`, `title`, `genre`, `year`.

### Metadata Write Path

PATCH `/api/songs/[id]` → `writeMetadataToFile()` (node-taglib-sharp writes to disk) → `rescanSongFile()` (re-extracts and syncs DB).

### Auth

NextAuth 5 with Credentials provider. Single user configured via `AUTH_USER` / `AUTH_PASSWORD` env vars. JWT session strategy. Middleware protects all routes except `/login` and `/api/auth`.

### Path Handling

Folder paths are URL-encoded when passed as route segments and decoded in API handlers. The `[[...path]]` catch-all segments handle nested folder paths.
