-- CreateTable
CREATE TABLE "listens" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" TEXT NOT NULL,
    "song_id" INTEGER,
    "listened_at" DATETIME NOT NULL,
    "track_name" TEXT NOT NULL,
    "artist_name" TEXT,
    "release_name" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "listens_song_id_fkey" FOREIGN KEY ("song_id") REFERENCES "songs" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "listens_user_id_listened_at_idx" ON "listens"("user_id", "listened_at");

-- CreateIndex
CREATE INDEX "listens_song_id_idx" ON "listens"("song_id");

-- CreateTable
CREATE TABLE "scrobble_accounts" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "api_root" TEXT,
    "encrypted_token" TEXT NOT NULL,
    "username" TEXT,
    "last_error" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "scrobble_accounts_user_id_provider_key" ON "scrobble_accounts"("user_id", "provider");

-- CreateTable
CREATE TABLE "scrobble_queue" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "account_id" INTEGER NOT NULL,
    "payload" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "last_error" TEXT,
    "next_attempt_at" DATETIME NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "scrobble_queue_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "scrobble_accounts" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "scrobble_queue_account_id_next_attempt_at_idx" ON "scrobble_queue"("account_id", "next_attempt_at");
