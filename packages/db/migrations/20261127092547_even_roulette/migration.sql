ALTER TABLE "bot_messages" ADD COLUMN "shown" text[];--> statement-breakpoint
ALTER TABLE "bot_posts" ADD COLUMN "voice" boolean DEFAULT false NOT NULL;