-- CreateTable
CREATE TABLE "song_deletions" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "deleted_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "song_deletions_deleted_at_idx" ON "song_deletions"("deleted_at");
