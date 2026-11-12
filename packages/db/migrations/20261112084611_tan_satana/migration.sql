CREATE TABLE "bot_messages" (
	"action_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"key" text PRIMARY KEY
);
--> statement-breakpoint
ALTER TABLE "user_settings" ADD COLUMN "cleanup_checked_at" timestamp with time zone;--> statement-breakpoint
CREATE INDEX "bot_messages_created_at_idx" ON "bot_messages" ("created_at");--> statement-breakpoint
ALTER TABLE "bot_messages" ADD CONSTRAINT "bot_messages_action_id_actions_id_fkey" FOREIGN KEY ("action_id") REFERENCES "actions"("id") ON DELETE CASCADE;