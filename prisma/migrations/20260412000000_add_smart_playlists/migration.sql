-- CreateTable
CREATE TABLE "smart_playlists" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "rules" TEXT NOT NULL,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "smart_playlists_user_id_idx" ON "smart_playlists"("user_id");

-- CreateIndex
CREATE INDEX "smart_playlists_is_public_idx" ON "smart_playlists"("is_public");
