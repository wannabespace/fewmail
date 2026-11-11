CREATE TABLE "accounts" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"access_token" text,
	"access_token_expires_at" timestamp with time zone,
	"account_id" text NOT NULL,
	"id_token" text,
	"password" text,
	"provider_id" text NOT NULL,
	"refresh_token" text,
	"refresh_token_expires_at" timestamp with time zone,
	"scope" text,
	"user_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "actions" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"autonomous" boolean NOT NULL,
	"detail" text,
	"kind" text NOT NULL,
	"message_id" uuid,
	"notified_at" timestamp with time zone,
	"reason" text NOT NULL,
	"resolved_at" timestamp with time zone,
	"rule_id" uuid,
	"status" text NOT NULL,
	"thread_id" text,
	"title" text NOT NULL,
	"user_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "analyses" (
	"category" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"extracted" jsonb NOT NULL,
	"importance" smallint NOT NULL,
	"message_id" uuid PRIMARY KEY,
	"model" text NOT NULL,
	"needs_reply" boolean NOT NULL,
	"reason" text NOT NULL,
	"rule_id" uuid,
	"summary" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "api_keys" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"key_hash" text NOT NULL UNIQUE,
	"last_used_at" timestamp with time zone,
	"name" text NOT NULL,
	"prefix" text NOT NULL,
	"user_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "briefs" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"body" text NOT NULL,
	"date" date NOT NULL,
	"headline" text NOT NULL,
	"stats" jsonb NOT NULL,
	"telegram_sent_at" timestamp with time zone,
	"user_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mailboxes" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"email" text NOT NULL,
	"history_id" text,
	"last_synced_at" timestamp with time zone,
	"sync_error" text,
	"user_id" uuid NOT NULL UNIQUE
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"body" text NOT NULL,
	"cc" text[] NOT NULL,
	"from_email" text NOT NULL,
	"from_name" text,
	"gmail_id" text NOT NULL,
	"has_attachments" boolean NOT NULL,
	"is_from_me" boolean NOT NULL,
	"is_unread" boolean NOT NULL,
	"label_ids" text[] NOT NULL,
	"list_unsubscribe" text,
	"list_unsubscribe_post" text,
	"mailbox_id" uuid NOT NULL,
	"message_id_header" text,
	"received_at" timestamp with time zone NOT NULL,
	"snippet" text NOT NULL,
	"subject" text NOT NULL,
	"thread_id" text NOT NULL,
	"to" text[] NOT NULL,
	"user_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rules" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"autonomous" boolean NOT NULL,
	"effect" text NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"instruction" text NOT NULL,
	"user_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"ip_address" text,
	"token" text NOT NULL UNIQUE,
	"user_agent" text,
	"user_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "telegram_links" (
	"chat_id" text UNIQUE,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"link_code" text NOT NULL UNIQUE,
	"linked_at" timestamp with time zone,
	"user_id" uuid PRIMARY KEY
);
--> statement-breakpoint
CREATE TABLE "user_settings" (
	"brief_hour" smallint DEFAULT 8 NOT NULL,
	"language" text NOT NULL,
	"onboarded_at" timestamp with time zone DEFAULT now() NOT NULL,
	"persona" text NOT NULL,
	"timezone" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"user_id" uuid PRIMARY KEY,
	"voice" text
);
--> statement-breakpoint
CREATE TABLE "users" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"email" text NOT NULL UNIQUE,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verifications" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL
);
--> statement-breakpoint
CREATE INDEX "accounts_userId_idx" ON "accounts" ("user_id");--> statement-breakpoint
CREATE INDEX "actions_user_status_idx" ON "actions" ("user_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "briefs_user_date_idx" ON "briefs" ("user_id","date");--> statement-breakpoint
CREATE UNIQUE INDEX "messages_mailbox_gmail_idx" ON "messages" ("mailbox_id","gmail_id");--> statement-breakpoint
CREATE INDEX "messages_user_received_idx" ON "messages" ("user_id","received_at");--> statement-breakpoint
CREATE INDEX "messages_thread_idx" ON "messages" ("user_id","thread_id");--> statement-breakpoint
CREATE INDEX "sessions_userId_idx" ON "sessions" ("user_id");--> statement-breakpoint
CREATE INDEX "verifications_identifier_idx" ON "verifications" ("identifier");--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "actions" ADD CONSTRAINT "actions_message_id_messages_id_fkey" FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "actions" ADD CONSTRAINT "actions_rule_id_rules_id_fkey" FOREIGN KEY ("rule_id") REFERENCES "rules"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "actions" ADD CONSTRAINT "actions_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "analyses" ADD CONSTRAINT "analyses_message_id_messages_id_fkey" FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "analyses" ADD CONSTRAINT "analyses_rule_id_rules_id_fkey" FOREIGN KEY ("rule_id") REFERENCES "rules"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "briefs" ADD CONSTRAINT "briefs_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "mailboxes" ADD CONSTRAINT "mailboxes_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_mailbox_id_mailboxes_id_fkey" FOREIGN KEY ("mailbox_id") REFERENCES "mailboxes"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "rules" ADD CONSTRAINT "rules_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "telegram_links" ADD CONSTRAINT "telegram_links_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;