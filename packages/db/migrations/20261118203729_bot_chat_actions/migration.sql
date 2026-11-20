ALTER TABLE "user_settings" ADD COLUMN "bots_cleared_at" jsonb DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "user_settings" ADD COLUMN "bot_folders" text;--> statement-breakpoint
ALTER TABLE "user_settings" ADD COLUMN "pinned_bots" text[] DEFAULT '{}'::text[] NOT NULL;