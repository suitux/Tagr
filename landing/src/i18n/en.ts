export const en = {
  meta: {
    landing: {
      title: 'Tagr: Self Hosted Music Metadata Editor for MP3, FLAC and More',
      description:
        'Tagr is an open source, self hosted music metadata editor. Browse, filter, play and edit audio tags for MP3, FLAC, M4A and Opus from any browser. Runs in Docker.',
      ogTitle: 'Tagr: the self hosted music metadata editor for your whole library',
    },
    docs: {
      title: 'Install Tagr: Docker Setup and Configuration Docs',
      description:
        'How to install and configure Tagr, the self hosted music metadata editor. Docker Compose, environment variables, music folder mounting, and troubleshooting.',
      ogTitle: 'Install Tagr: Docker setup and configuration',
    },
    notFound: {
      title: 'Page not found: Tagr',
      description: 'That page does not exist. Head back to the Tagr landing page or the install docs.',
    },
  },

  common: {
    skipToContent: 'Skip to content',
    copy: 'Copy',
    copied: 'Copied',
    copyAria: 'Copy code to clipboard',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    close: 'Close',
    langLabel: 'Language',
    github: 'GitHub',
    viewOnGithub: 'View on GitHub',
    liveDemo: 'Live Demo',
    tryDemo: 'Try the live demo',
    readDocs: 'Read the docs',
    onThisPage: 'On this page',
  },

  nav: {
    features: 'Features',
    screenshots: 'Screenshots',
    comparison: 'Comparison',
    docs: 'Docs',
    faq: 'FAQ',
  },

  hero: {
    eyebrow: 'Open source, AGPL-3.0, self hosted',
    h1Before: 'The ',
    h1Gradient: 'self hosted music metadata editor',
    h1After: ' for your whole library',
    sub: 'Scan your music folders, then browse, filter, play and edit tags for MP3, FLAC, M4A and Opus from any browser. Runs in Docker. Your files never leave your server.',
    ctaPrimary: 'Try the live demo',
    ctaPrimaryNote: 'demo / demo, read only',
    ctaSecondary: 'Deploy with Docker',
    runCommand:
      'docker run -d -p 3000:3000 -v /path/to/music:/music ghcr.io/suitux/tagr:latest',
    imageAlt:
      'Tagr, a self hosted music metadata editor, showing its three panel interface: the folder tree, a song list of FLAC files, and the metadata editor, with the waveform player at the bottom left',
  },

  trust: [
    { icon: 'scale', label: 'AGPL-3.0' },
    { icon: 'cpu', label: 'amd64 and arm64' },
    { icon: 'shield', label: 'No telemetry' },
    { icon: 'database', label: 'SQLite, no external database' },
    { icon: 'smartphone', label: 'Works on mobile' },
  ],

  why: {
    h2: 'Why run a self hosted music metadata editor',
    items: [
      {
        title: 'Your music, your server.',
        body: 'No cloud, no accounts, no uploads. Tagr writes tags straight to the files on your NAS.',
      },
      {
        title: 'Built for big libraries.',
        body: 'Virtual scrolling and SQLite indexing take tens of thousands of tracks without flinching.',
      },
      {
        title: 'Edit from anywhere.',
        body: 'A browser is the only requirement. No Wine, no VNC, no desktop tag editor.',
      },
    ],
  },

  features: {
    h2: 'A web based music tag editor that does the whole job',
    blocks: [
      {
        title: 'Edit 40+ metadata fields inline.',
        body: 'Title, artist, album, year, genre, composer, BPM, lyrics, sort fields, catalog numbers, barcodes. Add your own custom tags beyond the standard set. Manage album art: view, replace, upload. Star ratings from 1 to 5. Codec, bitrate, sample rate, channels and bit depth shown read only.',
        alt: 'Tagr metadata editor with a search filter applied to the song list and the detail panel open on an editable title, artist and album field',
      },
      {
        title: 'Full change history with one click revert.',
        body: 'Every change is recorded with its old and new value. Revert one edit, or shift and ctrl select to undo dozens at once. History views per song and per folder.',
        alt: 'Tagr change history panel listing metadata edits with their old and new values and a revert action on each row',
      },
      {
        title: 'Built in player with waveform.',
        body: 'A WaveSurfer.js waveform with click to seek, play and pause, previous and next, auto advance. A collapsible sidebar player with album art. Hear the track you are tagging without leaving the page.',
        altBig: 'Tagr expanded sidebar player showing album art, track title and an interactive WaveSurfer waveform',
        altMini: 'Tagr collapsed mini player showing the current track and playback controls in a single row',
      },
      {
        title: 'Browse a library of any size.',
        body: 'Three resizable panels: folder tree, song list, detail editor. Sort on any column. Filter by text, numeric range, date range or boolean. Show or hide any of 40+ columns. Virtual scrolling and infinite pagination.',
        altColumns: 'Tagr column picker showing toggles for over 40 available song list columns',
        altTree: 'Tagr folder tree with a right click context menu offering rescan and folder history actions',
      },
      {
        title: 'Share the library, not the password.',
        body: 'Give everyone their own account. The admin comes from your environment file, the rest are created inside Tagr with a role: a Tagger browses, plays, edits metadata and rescans, a Listener only browses and plays. The interface hides what a role cannot do and the API enforces it on every request. Listen history and play counts are kept per user.',
        alt: 'Tagr settings dialog open on the Users section, listing a tagger and a listener account with their role badges and edit and delete actions',
      },
      {
        title: 'Scrobble to ListenBrainz.',
        body: 'Paste your ListenBrainz token once and every play is forwarded to your profile, plus a playing now update while the track runs. Each user connects their own account, tokens are encrypted before they reach the database, and listens are queued and retried if ListenBrainz is unreachable. Point it at your own compatible server if you self host that too.',
        alt: 'Tagr settings dialog open on the third party integrations section, showing the ListenBrainz connection with a stored user token and an optional API root',
      },
    ],
    grid: [
      {
        icon: 'search',
        title: 'MusicBrainz lookup',
        body: 'Match songs against MusicBrainz and pick exactly which fields to apply.',
      },
      {
        icon: 'layers',
        title: 'Bulk editing',
        body: 'Select many songs, apply the same field changes or covers in one pass, confirm, review the summary.',
      },
      {
        icon: 'smartphone',
        title: 'Mobile first responsive UI',
        body: 'Full screen panels with swipe gestures, an expanded player, always visible edit actions. Installable as a PWA.',
      },
      {
        icon: 'list-music',
        title: 'Custom playlists',
        body: 'Group songs outside the folder structure.',
      },
      {
        icon: 'audio-waveform',
        title: 'Lossless detection',
        body: 'FLAC, WAV, AIFF and friends get an automatic Lossless badge.',
      },
      {
        icon: 'link',
        title: 'URL based state',
        body: 'Folder, song, sort and filters all live in the URL. Bookmark or share any view.',
      },
      {
        icon: 'users',
        title: 'Users and roles',
        body: 'Password protected access with user management built in: admin, tagger and listener.',
      },
      {
        icon: 'moon',
        title: 'Dark by default',
        body: 'Because you are going to be in here for a while.',
      },
    ],
  },

  formats: {
    h2: 'Supported audio formats: MP3, FLAC, M4A, Opus and more',
    list: [
      { name: 'MP3', lossless: false },
      { name: 'FLAC', lossless: true },
      { name: 'WAV', lossless: true },
      { name: 'AAC', lossless: false },
      { name: 'OGG', lossless: false },
      { name: 'M4A', lossless: false },
      { name: 'M4B', lossless: false },
      { name: 'WMA', lossless: false },
      { name: 'AIFF', lossless: true },
      { name: 'Opus', lossless: false },
    ],
    losslessBadge: 'Lossless',
    note: 'Tagr reads and writes tags with node-taglib-sharp and extracts metadata with music-metadata, the same libraries desktop tag editors rely on. Lossless formats are detected automatically.',
  },

  gallery: {
    h2: 'See Tagr running',
    tabs: { desktop: 'Desktop', mobile: 'Mobile' },
    openAria: 'Open screenshot at full size',
    dialogClose: 'Close screenshot',
    desktop: [
      {
        caption: 'The three panel browser.',
        alt: 'Tagr three panel interface with the folder tree on the left, a dense song list in the center and the metadata editor on the right',
      },
      {
        caption: 'Search and edit in the same view.',
        alt: 'Tagr with a text search filtering the song list while the metadata editor stays open on the selected track',
      },
      {
        caption: 'Every change, with a revert next to it.',
        alt: 'Tagr change history showing each metadata edit with its old value, new value and a revert button',
      },
      {
        caption: 'Show only the columns you use.',
        alt: 'Tagr column visibility menu with checkboxes for title, artist, album, bitrate and dozens of other columns',
      },
      {
        caption: 'Users and roles, no config file needed.',
        alt: 'Tagr settings dialog on the Users section with a tagger and a listener account and a create user button',
      },
      {
        caption: 'Your plays, on your ListenBrainz profile.',
        alt: 'Tagr settings dialog on the third party integrations section with the ListenBrainz account connected',
      },
    ],
    mobile: [
      {
        caption: 'The song list on a phone.',
        alt: 'Tagr mobile song list showing tracks with artist and album on a full screen panel',
      },
      {
        caption: 'The expanded player.',
        alt: 'Tagr mobile player expanded to full screen with album art, waveform and playback controls',
      },
      {
        caption: 'Editing tags on a phone.',
        alt: 'Tagr mobile song detail view with editable metadata fields and always visible edit actions',
      },
      {
        caption: 'Picking MusicBrainz fields.',
        alt: 'Tagr mobile MusicBrainz comparison view letting you choose which matched metadata fields to apply',
      },
    ],
  },

  comparison: {
    h2: 'Tagr vs other music tag editors',
    intro:
      'Most tag editors are desktop apps you have to run on the same machine as your files. Tagr runs where your music already lives.',
    tableAria: 'Feature comparison between Tagr, MusicBrainz Picard, Mp3tag, beets and MetadataRemote',
    featureCol: 'Capability',
    cols: ['Tagr', 'MusicBrainz Picard', 'Mp3tag', 'beets', 'MetadataRemote'],
    rows: [
      {
        feature: 'Runs in the browser, self hosted',
        cells: ['Yes', 'No, desktop app', 'No, desktop app', 'No, CLI', 'Yes'],
      },
      {
        feature: 'Works on mobile',
        cells: ['Yes, swipe gestures and PWA install', 'No', 'No', 'No', 'Responsive, not mobile specific'],
      },
      {
        feature: 'Docker, multi arch',
        cells: ['amd64, arm64', 'n/a', 'Windows first', 'Yes', 'amd64, arm64, armv7'],
      },
      {
        feature: 'Manual tag editing UI',
        cells: ['Yes, 40+ fields', 'Yes', 'Yes, very deep', 'No, CLI and config', 'Yes, all fields plus custom fields'],
      },
      {
        feature: 'Custom metadata fields',
        cells: ['Yes', 'Yes', 'Yes', 'Yes', 'Yes'],
      },
      {
        feature: 'Bulk editing',
        cells: ['Yes, multi select with summary', 'Yes', 'Yes', 'Yes', 'Yes, per file or whole folder'],
      },
      {
        feature: 'MusicBrainz lookup',
        cells: ['Yes', 'Yes, best in class', 'Via plugin', 'Yes', 'Yes, with confidence scoring'],
      },
      {
        feature: 'Undo and revert',
        cells: [
          'Persistent audit trail in SQLite, survives restarts, per song and per folder',
          'No',
          'No',
          'No',
          'Undo and redo up to 1,000 operations, in memory, cleared on container restart',
        ],
      },
      {
        feature: 'Built in player',
        cells: ['Yes, waveform with click to seek', 'Basic preview', 'No', 'No', 'Yes, in browser streaming'],
      },
      {
        feature: 'Album art management',
        cells: ['Yes: view, replace, upload, bulk apply', 'Yes', 'Yes', 'Via plugin', 'Yes'],
      },
      {
        feature: 'Sortable, filterable table with 40+ columns',
        cells: ['Yes', 'No', 'Yes', 'n/a', 'No'],
      },
      {
        feature: 'Advanced filters: text, numeric, date, boolean',
        cells: ['Yes', 'No', 'Partial', 'Via queries', 'Search filter only'],
      },
      {
        feature: 'Authentication and multi user',
        cells: ['Yes, built in', 'n/a', 'n/a', 'n/a', 'None, LAN only, needs a reverse proxy'],
      },
      {
        feature: 'Shareable, bookmarkable URL state',
        cells: ['Yes', 'No', 'No', 'No', 'No'],
      },
      {
        feature: 'Formats',
        cells: [
          'MP3, FLAC, WAV, AAC, OGG, M4A, M4B, WMA, AIFF, Opus',
          'Broad',
          'Broad',
          'Broad',
          'MP3, FLAC, OGG, Opus, M4A, M4B, WMA, WAV, WavPack',
        ],
      },
      {
        feature: 'License',
        cells: ['AGPL-3.0', 'GPL-2.0', 'Freeware, closed', 'MIT', 'AGPL-3.0'],
      },
    ],
    closing:
      'Picard and beets shine at automated, fingerprint driven library organization, and Mp3tag is the deepest manual editor on Windows. All three want to run on the machine your files sit on. Tagr keeps your library where it already lives and hands you a browser: a sortable, filterable view of every track, a persistent audit trail of every change you can revert, built in auth, and a UI that actually works on a phone.',
    faqLink: 'More on how Tagr differs, in the FAQ',
  },

  install: {
    h2: 'Install Tagr with Docker',
    intro: 'Three commands and a volume mount. The compose file below is the one from the repository.',
    tabs: ['Docker Compose', 'Docker run', 'Manual, Node 22+'],
    steps: [
      {
        title: 'Generate an auth secret',
        body: 'Run openssl rand -hex 32 and paste the output into AUTH_SECRET.',
      },
      {
        title: 'Bring the container up',
        body: 'Run docker compose up -d in the folder holding your compose file.',
      },
      {
        title: 'Open it and scan',
        body: 'Go to http://localhost:3000, log in, and hit scan to index your library.',
      },
    ],
    docsLink: 'Full installation docs',
  },

  faq: {
    h2: 'Frequently asked questions',
    items: [
      {
        q: 'What is a music metadata editor, and why self host one?',
        a: 'A music metadata editor reads and writes the tags stored inside your audio files: title, artist, album, year, genre, cover art and dozens more. Those tags are what Jellyfin, Navidrome and Plex read to build your library, so bad tags mean a broken library. Self hosting the editor means the files stay on your server and you fix them from a browser instead of copying terabytes to a laptop.',
      },
      {
        q: 'Does Tagr modify my original audio files?',
        a: 'Yes, and that is the point. Tagr writes tags into the actual files on disk using node-taglib-sharp, so any other player sees the change. The audio stream itself is never re-encoded. Every write is recorded in the change history with the old and new value, so you can revert it.',
      },
      {
        q: 'Which audio formats does Tagr support?',
        a: 'MP3, FLAC, WAV, AAC, OGG, M4A, M4B, WMA, AIFF and Opus. Lossless formats are detected automatically and carry a Lossless badge in the song list.',
      },
      {
        q: 'Can I run Tagr on a Synology, Unraid or Raspberry Pi?',
        a: 'Yes. The image on GHCR is multi-arch and covers linux/amd64 and linux/arm64, so it runs on x86 NAS boxes, Apple silicon and a Raspberry Pi 4 or 5 on a 64 bit OS. Mount your music share into the container at /music and set PUID and PGID to the user that owns the files.',
      },
      {
        q: 'How large a music library can Tagr handle?',
        a: 'Tens of thousands of tracks. Metadata is indexed into SQLite on scan, the song list uses virtual scrolling with infinite pagination, and filters and sorts run against the database rather than in the browser. The first scan is the slow part, since every file has to be read once.',
      },
      {
        q: 'Is Tagr free and open source?',
        a: 'Yes, under AGPL-3.0-only. The source is on GitHub, there is no paid tier and no license key. If it saves you an afternoon of tagging, you can buy the author a coffee.',
      },
      {
        q: 'Does Tagr send any data to the cloud?',
        a: 'No telemetry, no analytics, no phoning home. The one outbound call Tagr can make is to the MusicBrainz API, and only when you explicitly ask it to look a song up. Skip that feature and the container never talks to the internet.',
      },
      {
        q: 'Can I use Tagr from my phone?',
        a: 'Yes. The UI is responsive and mobile first: full screen panels with swipe gestures between the folder tree, song list and editor, an expanded player, and edit actions that are always visible rather than hidden behind hover. It installs as a PWA from the browser.',
      },
      {
        q: 'How is Tagr different from MusicBrainz Picard or Mp3tag?',
        a: 'Picard and Mp3tag are desktop applications that need to run on the machine holding your files, which for most self hosters is a headless server. Tagr runs on that server and gives you a browser UI instead. It also keeps a persistent audit trail of every edit and works on a phone, which neither of them does.',
      },
      {
        q: 'Can multiple people use the same Tagr instance?',
        a: 'Yes. Tagr has password protected access and user management built in, so you can create an account for each person who shares the library, with a role that decides what they can do: taggers edit metadata and rescan, listeners only browse and play. Access is per user, not a single shared password.',
      },
      {
        q: 'Can I undo a metadata change?',
        a: 'Yes. Every change is stored in SQLite with its old and new value, and the audit trail survives container restarts. Revert a single edit from the song history, or shift and ctrl select a range and revert dozens at once. There are history views per song and per folder.',
      },
      {
        q: 'Do I need to expose Tagr to the internet?',
        a: 'No. Most people run it on the LAN and reach it at http://server:3000. If you do want it reachable from outside, put it behind a reverse proxy with TLS and set AUTH_URL to the public URL so sessions and redirects resolve correctly.',
      },
    ],
  },

  finalCta: {
    h2: 'Take back control of your music tags',
    note: 'Free and open source. Runs on your hardware. AGPL-3.0.',
  },

  footer: {
    tagline: 'A self hosted music metadata editor with a modern, intuitive web UI.',
    groups: [
      {
        title: 'Product',
        links: [
          { label: 'Features', href: '#features' },
          { label: 'Screenshots', href: '#screenshots' },
          { label: 'Comparison', href: '#comparison' },
          { label: 'Demo', href: 'https://tagr-demo.fly.dev/', external: true },
        ],
      },
      {
        title: 'Docs',
        links: [
          { label: 'Quick start', href: '/docs/#quick-start' },
          { label: 'Docker', href: '/docs/#quick-start' },
          { label: 'Configuration', href: '/docs/#environment-variables' },
          { label: 'Troubleshooting', href: '/docs/#troubleshooting' },
        ],
      },
      {
        title: 'Project',
        links: [
          { label: 'GitHub', href: 'https://github.com/suitux/Tagr', external: true },
          { label: 'Releases', href: 'https://github.com/suitux/Tagr/releases', external: true },
          { label: 'Issues', href: 'https://github.com/suitux/Tagr/issues', external: true },
          { label: 'License', href: 'https://github.com/suitux/Tagr/blob/main/LICENSE', external: true },
        ],
      },
      {
        title: 'Support',
        links: [
          { label: 'Sponsor', href: 'https://github.com/sponsors/suitux', external: true },
          { label: 'Report a bug', href: 'https://github.com/suitux/Tagr/issues/new', external: true },
        ],
      },
    ],
    bmc: 'Buy me a coffee',
    rights: 'Tagr, AGPL-3.0',
  },

  notFound: {
    h1: 'That page does not exist',
    body: 'The link is dead or the page moved. Two places worth trying:',
    home: 'Back to the landing page',
    docs: 'Install and configuration docs',
  },

  docs: {
    h1: 'Install and configure Tagr',
    intro:
      'Everything you need to run Tagr, the self hosted music metadata editor, on your own server. Docker Compose is the fastest path. A manual Node install is documented below it.',
    sections: {
      requirements: {
        title: 'Requirements',
        body: 'Docker and the Docker Compose plugin, on any host that runs linux/amd64 or linux/arm64. That covers most NAS boxes, a home server, a VPS, and a Raspberry Pi 4 or 5 on a 64 bit OS. If you would rather not use Docker, you need Node.js 22 or newer and pnpm. You also need read and write access to the music folders you want to edit, since Tagr writes tags back into the files themselves.',
      },
      quickStart: {
        title: 'Quick start with Docker Compose',
        p1: 'Grab the compose file from the repository:',
        p2: 'Generate a secret for signing sessions and paste the output into AUTH_SECRET:',
        p3: 'Edit the environment block, set your own AUTH_USER and AUTH_PASSWORD, and point the second volume at your music. Then bring it up:',
        p4: 'Open http://localhost:3000, log in with the credentials you set, and press the scan button to index your library. The first scan reads every file once, so on a large library it takes a while.',
      },
      mounting: {
        title: 'Mounting music folders',
        p1: 'Tagr scans /music recursively. If your music lives in several places on the host, mount each of them as a subdirectory under /music and they are all picked up automatically:',
        p2: 'MUSIC_FOLDERS is only needed when you want to restrict scanning to specific subdirectories, for example to index /music/library but skip /music/podcasts. Leave it unset and everything under /music is scanned.',
        p3: 'Tagr needs write access to these paths. Set PUID and PGID to the user and group that own the files on the host, otherwise saving a tag fails with a permission error.',
      },
      env: {
        title: 'Environment variables',
        cols: ['Variable', 'Required', 'Description', 'Example'],
        rows: [
          {
            name: 'DATABASE_URL',
            required: 'Yes',
            desc: 'Path to the SQLite database. Keep it on a persisted volume.',
            example: 'file:/data/tagr.db',
          },
          {
            name: 'AUTH_SECRET',
            required: 'Yes',
            desc: 'Secret used to sign JWT sessions. Generate it with openssl rand -hex 32.',
            example: 'c5398a60cfd6...',
          },
          {
            name: 'AUTH_USER',
            required: 'Yes',
            desc: 'Username for the initial account.',
            example: 'admin',
          },
          {
            name: 'AUTH_PASSWORD',
            required: 'Yes',
            desc: 'Password for the initial account.',
            example: 'a-long-password',
          },
          {
            name: 'AUTH_URL',
            required: 'No',
            desc: 'Public URL of the instance. Required when Tagr sits behind a reverse proxy, so redirects and session cookies resolve to the right origin.',
            example: 'https://tagr.example.com',
          },
          {
            name: 'MUSIC_FOLDERS',
            required: 'No',
            desc: 'Comma separated list of paths to scan. Defaults to /music. Set it only to restrict scanning to specific subdirectories.',
            example: '/music/library,/music/nas',
          },
          {
            name: 'PUID',
            required: 'No',
            desc: 'User ID the container process runs as. Match it to the owner of your music files. Docker only.',
            example: '1000',
          },
          {
            name: 'PGID',
            required: 'No',
            desc: 'Group ID the container process runs as. Docker only.',
            example: '1000',
          },
          {
            name: 'NODE_ENV',
            required: 'No',
            desc: 'Runtime mode. Use production for a normal deployment.',
            example: 'production',
          },
        ],
      },
      manual: {
        title: 'Manual installation',
        p1: 'Requires Node.js 22 or newer.',
        p2: 'Create a .env file in the project root:',
        p3: 'Then build and start:',
      },
      scanning: {
        title: 'Scanning your library',
        p1: 'A scan walks the configured folders, reads the tags out of every audio file with music-metadata, and upserts one row per track into SQLite. Nothing is copied, nothing is moved, and no audio is re-encoded. The database is an index of your files, not a replacement for them.',
        p2: 'Rescanning is safe to repeat. New files are added, files that disappeared from disk are dropped from the index, and existing rows are updated in place, so your change history survives. When a scan finishes, a summary dialog reports how many files were added, updated and removed.',
        p3: 'Scan from the folder tree context menu to reindex a single folder rather than the whole library.',
      },
      updating: {
        title: 'Updating',
        p1: 'Pull the new image and recreate the container. The database volume is untouched, so nothing is rescanned:',
      },
      backups: {
        title: 'Backups',
        p1: 'Two things are worth backing up, and only one of them belongs to Tagr. Your tags live inside the audio files themselves, so your existing music backup already covers them. What Tagr owns is the SQLite database in the sqlite_data volume, which holds the index, your saved filters, your playlists and the full change history.',
        p2: 'Copy the database out of the volume while the container is stopped, or snapshot the volume:',
      },
      troubleshooting: {
        title: 'Troubleshooting',
        items: [
          {
            q: 'Saving a tag fails with a permission error',
            a: 'The container process cannot write to the file. Check who owns the music on the host with ls -ln, then set PUID and PGID to that user and group and recreate the container. A read only bind mount produces the same symptom, so make sure the volume is not marked :ro.',
          },
          {
            q: 'The scan finishes but no files show up',
            a: 'The music is probably not under /music inside the container. Exec into it and look: docker exec -it tagr ls /music. If the folder is empty, the bind mount on the left side of the colon points at the wrong host path. If MUSIC_FOLDERS is set, confirm the paths in it are container paths, not host paths.',
          },
          {
            q: 'Login redirects to the wrong host behind a reverse proxy',
            a: 'Set AUTH_URL to the public URL you actually browse to, including the scheme, for example https://tagr.example.com. Then make sure the proxy forwards the Host, X-Forwarded-Proto and X-Forwarded-For headers.',
          },
          {
            q: 'arm64 and Raspberry Pi notes',
            a: 'The image covers linux/arm64, so a Pi 4 or Pi 5 works, but it has to be running a 64 bit OS. A 32 bit Raspberry Pi OS cannot pull the image. On a Pi, expect the first scan of a large library to be slow, since it is bound by reading every file off the SD card or USB disk.',
          },
        ],
      },
      proxy: {
        title: 'Reverse proxy examples',
        p1: 'Caddy, which handles TLS for you:',
        p2: 'Nginx:',
        p3: 'In both cases set AUTH_URL to the public URL so session redirects land on the right origin.',
      },
    },
  },
} as const;

export type Dict = typeof en;
