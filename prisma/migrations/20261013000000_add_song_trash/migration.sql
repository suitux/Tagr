-- AlterTable
ALTER TABLE "songs" ADD COLUMN "deleted_at" DATETIME;
ALTER TABLE "songs" ADD COLUMN "original_file_path" TEXT;

-- CreateIndex
CREATE INDEX "songs_deleted_at_idx" ON "songs"("deleted_at");
