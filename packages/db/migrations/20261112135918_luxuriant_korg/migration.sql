ALTER TABLE "board_entries" ADD COLUMN "due_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "boards" ADD COLUMN "banner_days" smallint;--> statement-breakpoint
ALTER TABLE "user_settings" ADD COLUMN "reading_digest" boolean DEFAULT true NOT NULL;