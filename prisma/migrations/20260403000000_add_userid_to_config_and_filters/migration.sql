-- Recreate user_config with composite PK (user_id, key)
CREATE TABLE "user_config_new" (
    "user_id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    PRIMARY KEY ("user_id", "key")
);

INSERT INTO "user_config_new" ("user_id", "key", "value")
SELECT 'admin', "key", "value" FROM "user_config";

DROP TABLE "user_config";

ALTER TABLE "user_config_new" RENAME TO "user_config";

-- Add user_id to saved_filters
ALTER TABLE "saved_filters" ADD COLUMN "user_id" TEXT NOT NULL DEFAULT 'admin';

-- CreateIndex
CREATE INDEX "saved_filters_user_id_idx" ON "saved_filters"("user_id");
