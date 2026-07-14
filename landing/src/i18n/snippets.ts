/** Code shown on the site. Lifted from the Tagr repository so the site never drifts from the README. */

export const COMPOSE = `services:
  tagr:
    image: ghcr.io/suitux/tagr:latest
    container_name: tagr
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - PUID=1000
      - PGID=1000
      - NODE_ENV=production
      - DATABASE_URL=file:/data/tagr.db
      - AUTH_SECRET=paste-your-generated-secret-here
      - AUTH_USER=admin
      - AUTH_PASSWORD=your-password-here
      - AUTH_URL=https://your-domain.com
    volumes:
      - sqlite_data:/data
      - /path/to/your/music:/music

volumes:
  sqlite_data:`;

export const DOCKER_RUN = `docker run -d \\
  --name tagr \\
  -p 3000:3000 \\
  -e PUID=1000 \\
  -e PGID=1000 \\
  -e DATABASE_URL=file:/data/tagr.db \\
  -e AUTH_SECRET=paste-your-generated-secret-here \\
  -e AUTH_USER=admin \\
  -e AUTH_PASSWORD=your-password-here \\
  -v tagr_data:/data \\
  -v /path/to/your/music:/music \\
  ghcr.io/suitux/tagr:latest`;

export const MANUAL = `git clone https://github.com/suitux/Tagr.git
cd Tagr
pnpm install
pnpm build && pnpm start`;

export const ENV_FILE = `DATABASE_URL=file:./data/tagr.db
AUTH_SECRET="c5398a60cfd61607192d74ae8db237aaeaa07a98cd8ecdb8776c86eb87376ba3"
AUTH_USER="admin"
AUTH_PASSWORD="admin"
MUSIC_FOLDERS="/Users/youruser/Music,/Volumes/External/Music"`;

export const SECRET = 'openssl rand -hex 32';

export const COMPOSE_UP = 'docker compose up -d';

export const FETCH_COMPOSE =
  'wget https://raw.githubusercontent.com/suitux/Tagr/main/docker-compose.yml';

export const UPDATE = 'docker compose pull && docker compose up -d';

export const MULTI_MOUNT = `volumes:
  - /home/user/Music:/music/library
  - /mnt/nas/Music:/music/nas`;

export const BACKUP = `docker compose stop tagr
docker run --rm -v sqlite_data:/data -v "$PWD":/backup alpine \\
  tar czf /backup/tagr-db-backup.tar.gz -C /data .
docker compose start tagr`;

export const CADDY = `tagr.example.com {
  reverse_proxy localhost:3000
}`;

export const NGINX = `server {
  listen 443 ssl;
  server_name tagr.example.com;

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  }
}`;
