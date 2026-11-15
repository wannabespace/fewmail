CREATE TABLE "case_items" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"case_id" uuid NOT NULL,
	"is_theirs" boolean NOT NULL,
	"position" smallint NOT NULL,
	"proof" text,
	"source" text,
	"state" text NOT NULL,
	"text" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "case_mail" (
	"case_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"message_id" uuid,
	CONSTRAINT "case_mail_pkey" PRIMARY KEY("case_id","message_id")
);
--> statement-breakpoint
CREATE TABLE "cases" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"due_at" timestamp with time zone,
	"goal" text NOT NULL,
	"message_id" uuid,
	"next" text,
	"notified_at" timestamp with time zone,
	"planned_at" timestamp with time zone,
	"reminded_at" timestamp with time zone,
	"searches" text,
	"status" text NOT NULL,
	"thread_ids" text[] NOT NULL,
	"title" text NOT NULL,
	"user_id" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_settings" ADD COLUMN "cases_scanned_at" timestamp with time zone;--> statement-breakpoint
CREATE INDEX "case_items_case_idx" ON "case_items" ("case_id");--> statement-breakpoint
CREATE INDEX "cases_user_status_idx" ON "cases" ("user_id","status");--> statement-breakpoint
ALTER TABLE "case_items" ADD CONSTRAINT "case_items_case_id_cases_id_fkey" FOREIGN KEY ("case_id") REFERENCES "cases"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "case_mail" ADD CONSTRAINT "case_mail_case_id_cases_id_fkey" FOREIGN KEY ("case_id") REFERENCES "cases"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "case_mail" ADD CONSTRAINT "case_mail_message_id_messages_id_fkey" FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "cases" ADD CONSTRAINT "cases_message_id_messages_id_fkey" FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "cases" ADD CONSTRAINT "cases_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;