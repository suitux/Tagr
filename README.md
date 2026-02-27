# Tagr

**A self-hosted music metadata editor with a modern, intuitive web UI.**

Tagr lets you browse, edit, and manage audio file tags from any browser. Just point it at your music folders, and get a clean three-panel interface for organizing your library — no desktop apps, no CLI wizardry.

<!-- ![Tagr Screenshot](docs/screenshot.png) -->

---

## Why?

Most metadata editors are either desktop-only, command-line tools, or bloated apps with steep learning curves. If your music lives on a NAS, a server, or a headless machine, editing tags means SSH, mounting drives, or syncing files back and forth.

Tagr takes a different approach:

- **Run it anywhere** — Docker, bare metal, your NAS. If it runs Node.js, it runs Tagr.
- **Edit from any browser** — No installs, no plugins. Just open a tab.
- **Do one thing well** — Browse your library, edit tags, save. That's it.

---

## Features

### Metadata Editing

- Edit **40+ metadata fields** inline — title, artist, album, year, genre, composer, BPM, lyrics, and more
- **Album art** management — view, replace, and upload cover images directly
- **Star ratings** (1–5) with a visual widget
- Support for track/disc numbering, sort fields, catalog numbers, barcodes, and extended tags
- Read-only display of audio properties (codec, bitrate, sample rate, channels, bits per sample)

### Change History

- **Full audit trail** of every metadata change with old and new values
- **Revert** individual changes or bulk-select and undo multiple edits at once
- Searchable history with shift+click and ctrl+click multi-selection
- Per-song and per-folder history views

### Music Player

- **Built-in audio player** with interactive waveform visualization (WaveSurfer.js)
- Play/pause, previous/next track navigation
- Click-to-seek on the waveform
- Auto-advance to next song
- Collapsible sidebar player with album art, title, and artist display

### Library Browsing

- **Three-panel layout** — folder tree, song list, and detail editor side by side
- **Folder tree** with hierarchical navigation and real-time search
- **Sorting** on any column — title, artist, album, year, duration, bitrate, date added, and dozens more
- **Advanced filtering** — text, numeric ranges, date ranges, and boolean filters across all fields
- **Customizable columns** — show/hide any of 40+ columns to match your workflow
- Virtual scrolling and infinite pagination for large libraries

### File Support

| Format | Supported |
|--------|-----------|
| MP3    | Yes       |
| FLAC   | Yes       |
| WAV    | Yes       |
| AAC    | Yes       |
| OGG    | Yes       |
| M4A    | Yes       |
| WMA    | Yes       |
| AIFF   | Yes       |

Lossless formats are automatically detected and displayed with a badge.

### Additional

- **Single-user authentication** — password-protected access with bcrypt hashing
- **Resizable panels** — drag to resize the three-panel layout to your liking
- **Dark theme** by default
- **Toast notifications** for operation feedback
- **URL-based state** — bookmarkable views with folder, song, sort, and filter state preserved in the URL

---

## Quick Start with Docker

### 1. Clone the repository

```bash
git clone https://github.com/suitux/tagr.git
cd tagr
```

### 2. Generate a password hash

```bash
npm run generate-hash [your-password-here]
```

Copy the resulting `\$2b\$12\$...` hash for the next step.

### 3. Configure `docker-compose.yml`

```yaml
services:
  tagr:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: tagr
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=file:/data/tagr.db
      - AUTH_SECRET=any-random-secret-string-here (generate with npx auth secret)
      - AUTH_USER=admin
      - AUTH_PASSWORD=[your-generated-password-here]
    volumes:
      - sqlite_data:/data
      # Mount your music folder into the container:
      - /path/to/your/music:/music

volumes:
  sqlite_data:
```

> **Multiple folders:** If your music is spread across different host paths, mount them as subdirectories under `/music`. Tagr scans `/music` recursively, so all subdirectories are included automatically:
>
> ```yaml
> volumes:
>   - /home/user/Music:/music/library
>   - /mnt/nas/Music:/music/nas
> ```
>
> Set `MUSIC_FOLDERS` only if you want to **restrict** scanning to specific subdirectories (e.g., scan `/music/library` but skip `/music/podcasts`).

### 4. Build and run

```bash
docker compose up -d
```

### 5. Open your browser

Navigate to [http://localhost:3000](http://localhost:3000), log in with your credentials, and hit the **scan** button to index your library.

---

## Manual Installation

Requirements: **Node.js 22+** and **pnpm**.

```bash
git clone https://github.com/your-user/tagr.git
cd tagr
pnpm install
```

Create a `.env` file in the project root:

```env
DATABASE_URL=file:./data/tagr.db
AUTH_SECRET="any-random-secret-string"
AUTH_USER="admin"
AUTH_PASSWORD="$2b$12$..."
MUSIC_FOLDERS="/path/to/your/music"
```

Generate your password hash and start:

```bash
pnpm generate-hash       # Follow the prompt, paste the hash into .env
pnpm build && pnpm start # Production
# or
pnpm dev                 # Development mode
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | SQLite database path. Use `file:/data/tagr.db` in Docker or `file:./data/tagr.db` locally. |
| `AUTH_SECRET` | Yes | Random string used for signing JWT sessions. |
| `AUTH_USER` | Yes | Login username. |
| `AUTH_PASSWORD` | Yes | Bcrypt-hashed password. Generate with `pnpm generate-hash`. |
| `MUSIC_FOLDERS` | No | Comma-separated list of paths to music directories. Defaults to `/music` if not set. |

---

## Docker Volumes

| Container Path | Purpose |
|----------------|---------|
| `/data` | SQLite database. Persist with a named volume to avoid data loss. |
| `/music/*` | Mount points for your music libraries. |

---

## Architecture

```
Browser (React Query) --> Next.js API Routes --> Prisma --> SQLite
                                                   |
                                          node-taglib-sharp --> audio files on disk
```

| Layer | Technology |
|-------|------------|
| Frontend | React 19, TanStack Query, Shadcn UI, Tailwind CSS 4 |
| Backend | Next.js 16 App Router (route handlers) |
| Database | SQLite via Prisma 7 + LibSQL |
| Auth | NextAuth 5 (credentials provider, JWT sessions) |
| Metadata Read | music-metadata |
| Metadata Write | node-taglib-sharp |
| Audio Player | WaveSurfer.js |

---

## License

MIT
