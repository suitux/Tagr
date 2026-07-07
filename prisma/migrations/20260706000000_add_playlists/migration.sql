-- CreateTable
CREATE TABLE "playlists" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "playlist_items" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "playlist_id" INTEGER NOT NULL,
    "song_id" INTEGER NOT NULL,
    "sort_index" INTEGER NOT NULL,
    "added_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "playlist_items_playlist_id_fkey" FOREIGN KEY ("playlist_id") REFERENCES "playlists" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "playlist_items_song_id_fkey" FOREIGN KEY ("song_id") REFERENCES "songs" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "playlists_user_id_idx" ON "playlists"("user_id");

-- CreateIndex
CREATE INDEX "playlists_is_public_idx" ON "playlists"("is_public");

-- CreateIndex
CREATE INDEX "playlist_items_playlist_id_sort_index_idx" ON "playlist_items"("playlist_id", "sort_index");

-- CreateIndex
CREATE UNIQUE INDEX "playlist_items_playlist_id_song_id_key" ON "playlist_items"("playlist_id", "song_id");
