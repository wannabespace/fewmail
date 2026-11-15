CREATE TABLE "reading_issues" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"day" date NOT NULL,
	"message_ids" uuid[] NOT NULL,
	"summary" text,
	"user_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "reading_issues_user_day_idx" ON "reading_issues" ("user_id","day");--> statement-breakpoint
ALTER TABLE "reading_issues" ADD CONSTRAINT "reading_issues_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;