-- CreateTable
CREATE TABLE "songs" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "file_path" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "folder_path" TEXT NOT NULL,
    "extension" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "created_at" DATETIME,
    "modified_at" DATETIME,
    "scanned_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "title" TEXT,
    "artist" TEXT,
    "sort_artist" TEXT,
    "album" TEXT,
    "sort_album" TEXT,
    "track_number" INTEGER,
    "track_total" INTEGER,
    "disc_number" INTEGER,
    "disc_total" INTEGER,
    "year" INTEGER,
    "bpm" INTEGER,
    "genre" TEXT,
    "album_artist" TEXT,
    "sort_album_artist" TEXT,
    "composer" TEXT,
    "conductor" TEXT,
    "comment" TEXT,
    "grouping" TEXT,
    "publisher" TEXT,
    "description" TEXT,
    "catalog_number" TEXT,
    "disc_subtitle" TEXT,
    "lyricist" TEXT,
    "barcode" TEXT,
    "work" TEXT,
    "movement_name" TEXT,
    "movement" INTEGER,
    "original_release_date" TEXT,
    "copyright" TEXT,
    "rating" INTEGER,
    "lyrics" TEXT,
    "compilation" BOOLEAN DEFAULT false,
    "volume" REAL,
    "start_time" REAL,
    "stop_time" REAL,
    "gapless" BOOLEAN DEFAULT false,
    "date_added" DATETIME,
    "last_played" DATETIME,
    "play_count" INTEGER DEFAULT 0,
    "duration" REAL,
    "bitrate" INTEGER,
    "sample_rate" INTEGER,
    "channels" INTEGER,
    "bits_per_sample" INTEGER,
    "codec" TEXT,
    "lossless" BOOLEAN NOT NULL DEFAULT false,
    "encoder" TEXT
);

-- CreateTable
CREATE TABLE "song_metadata" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "song_id" INTEGER NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT,
    CONSTRAINT "song_metadata_song_id_fkey" FOREIGN KEY ("song_id") REFERENCES "songs" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "song_pictures" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "song_id" INTEGER NOT NULL,
    "type" TEXT,
    "format" TEXT,
    "description" TEXT,
    "data" BLOB,
    CONSTRAINT "song_pictures_song_id_fkey" FOREIGN KEY ("song_id") REFERENCES "songs" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "songs_file_path_key" ON "songs"("file_path");

-- CreateIndex
CREATE INDEX "songs_folder_path_idx" ON "songs"("folder_path");

-- CreateIndex
CREATE UNIQUE INDEX "song_metadata_song_id_key_key" ON "song_metadata"("song_id", "key");

-- CreateIndex
CREATE INDEX "song_pictures_song_id_idx" ON "song_pictures"("song_id");
