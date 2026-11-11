ALTER TABLE "mailboxes" ADD COLUMN "address_hash" text;--> statement-breakpoint
ALTER TABLE "mailboxes" ADD COLUMN "watch_expires_at" timestamp with time zone;--> statement-breakpoint
CREATE INDEX "mailboxes_address_hash_idx" ON "mailboxes" ("address_hash");