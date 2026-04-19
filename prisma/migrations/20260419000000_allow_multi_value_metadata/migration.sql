-- DropIndex
DROP INDEX IF EXISTS "song_metadata_song_id_key_key";

-- CreateIndex
CREATE INDEX "song_metadata_song_id_key_idx" ON "song_metadata"("song_id", "key");
