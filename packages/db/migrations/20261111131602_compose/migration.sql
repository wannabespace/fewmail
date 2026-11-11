CREATE TABLE "outbox" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"action_id" uuid,
	"bcc" text[] NOT NULL,
	"cc" text[] NOT NULL,
	"error" text,
	"html" text NOT NULL,
	"in_reply_to" text,
	"mode" text NOT NULL,
	"references" text,
	"remind_after_days" smallint,
	"send_at" timestamp with time zone NOT NULL,
	"status" text NOT NULL,
	"subject" text NOT NULL,
	"text" text NOT NULL,
	"thread_id" text,
	"to" text[] NOT NULL,
	"user_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reminders" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"due_at" timestamp with time zone NOT NULL,
	"kind" text NOT NULL,
	"since" timestamp with time zone,
	"status" text NOT NULL,
	"thread_id" text NOT NULL,
	"user_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "snippets" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"html" text NOT NULL,
	"name" text NOT NULL,
	"user_id" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "mailboxes" ADD COLUMN "label_ids" jsonb DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "user_settings" ADD COLUMN "gmail_labels" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "user_settings" ADD COLUMN "knowledge" text;--> statement-breakpoint
CREATE INDEX "outbox_due_idx" ON "outbox" ("status","send_at");--> statement-breakpoint
CREATE INDEX "reminders_due_idx" ON "reminders" ("status","due_at");--> statement-breakpoint
CREATE INDEX "reminders_thread_idx" ON "reminders" ("user_id","thread_id");--> statement-breakpoint
ALTER TABLE "outbox" ADD CONSTRAINT "outbox_action_id_actions_id_fkey" FOREIGN KEY ("action_id") REFERENCES "actions"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "outbox" ADD CONSTRAINT "outbox_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "reminders" ADD CONSTRAINT "reminders_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "snippets" ADD CONSTRAINT "snippets_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;