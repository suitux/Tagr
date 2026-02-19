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
    "album" TEXT,
    "album_artist" TEXT,
    "year" INTEGER,
    "track_number" INTEGER,
    "track_total" INTEGER,
    "disc_number" INTEGER,
    "disc_total" INTEGER,
    "genre" TEXT,
    "duration" REAL,
    "composer" TEXT,
    "comment" TEXT,
    "lyrics" TEXT,
    "bitrate" INTEGER,
    "sample_rate" INTEGER,
    "channels" INTEGER,
    "bits_per_sample" INTEGER,
    "codec" TEXT,
    "lossless" BOOLEAN NOT NULL DEFAULT false
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
CREATE INDEX "songs_artist_idx" ON "songs"("artist");

-- CreateIndex
CREATE INDEX "songs_album_idx" ON "songs"("album");

-- CreateIndex
CREATE INDEX "songs_title_idx" ON "songs"("title");

-- CreateIndex
CREATE INDEX "songs_genre_idx" ON "songs"("genre");

-- CreateIndex
CREATE INDEX "songs_year_idx" ON "songs"("year");

-- CreateIndex
CREATE INDEX "song_metadata_song_id_idx" ON "song_metadata"("song_id");

-- CreateIndex
CREATE INDEX "song_metadata_key_idx" ON "song_metadata"("key");

-- CreateIndex
CREATE UNIQUE INDEX "song_metadata_song_id_key_key" ON "song_metadata"("song_id", "key");

-- CreateIndex
CREATE INDEX "song_pictures_song_id_idx" ON "song_pictures"("song_id");
