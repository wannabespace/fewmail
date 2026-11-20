-- Rules become the user's bots, as they are: each keeps its id, instruction or match, effect and on/off.
ALTER TABLE "rules" RENAME TO "bots";--> statement-breakpoint
ALTER INDEX "rules_pkey" RENAME TO "bots_pkey";--> statement-breakpoint
ALTER TABLE "bots" RENAME CONSTRAINT "rules_user_id_users_id_fkey" TO "bots_user_id_users_id_fkey";--> statement-breakpoint
ALTER TABLE "bots" ADD COLUMN "name" text;--> statement-breakpoint
ALTER TABLE "actions" RENAME COLUMN "rule_id" TO "bot_id";--> statement-breakpoint
ALTER TABLE "actions" RENAME CONSTRAINT "actions_rule_id_rules_id_fkey" TO "actions_bot_id_bots_id_fkey";--> statement-breakpoint
ALTER TABLE "analyses" RENAME COLUMN "rule_id" TO "bot_id";--> statement-breakpoint
ALTER TABLE "analyses" RENAME CONSTRAINT "analyses_rule_id_rules_id_fkey" TO "analyses_bot_id_bots_id_fkey";--> statement-breakpoint
ALTER TABLE "declined_rule_suggestions" RENAME TO "declined_bot_suggestions";--> statement-breakpoint
ALTER INDEX "declined_rule_suggestions_pkey" RENAME TO "declined_bot_suggestions_pkey";--> statement-breakpoint
ALTER INDEX "declined_rule_suggestions_user_sender_idx" RENAME TO "declined_bot_suggestions_user_sender_idx";--> statement-breakpoint
ALTER TABLE "declined_bot_suggestions" RENAME CONSTRAINT "declined_rule_suggestions_user_id_users_id_fkey" TO "declined_bot_suggestions_user_id_users_id_fkey";--> statement-breakpoint
CREATE TABLE "bot_posts" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"action_ids" uuid[] DEFAULT '{}'::uuid[] NOT NULL,
	"bot" text NOT NULL,
	"delivered_at" timestamp with time zone,
	"due_at" timestamp with time zone DEFAULT now() NOT NULL,
	"kind" text NOT NULL,
	"text" text,
	"thread_id" text,
	"tools" text[] DEFAULT '{}'::text[] NOT NULL,
	"user_id" uuid NOT NULL
);--> statement-breakpoint
CREATE INDEX "bot_posts_user_bot_idx" ON "bot_posts" ("user_id","bot","due_at");--> statement-breakpoint
CREATE INDEX "bot_posts_due_idx" ON "bot_posts" ("delivered_at","due_at");--> statement-breakpoint
ALTER TABLE "bot_posts" ADD CONSTRAINT "bot_posts_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "user_settings" ADD COLUMN "bots_read_at" jsonb DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "user_settings" ADD COLUMN "muted_bots" text[] DEFAULT '{}'::text[] NOT NULL;
