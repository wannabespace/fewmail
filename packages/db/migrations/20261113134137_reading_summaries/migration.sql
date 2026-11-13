CREATE TABLE "reading_summaries" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"message_ids" uuid[] NOT NULL,
	"summary" text NOT NULL,
	"user_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "reading_summaries_user_idx" ON "reading_summaries" ("user_id");--> statement-breakpoint
ALTER TABLE "reading_summaries" ADD CONSTRAINT "reading_summaries_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;