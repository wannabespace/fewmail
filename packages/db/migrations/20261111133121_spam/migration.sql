CREATE TABLE "sender_reports" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"domain_hash" text,
	"sender_hash" text NOT NULL,
	"user_id" uuid NOT NULL,
	"verdict" text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "sender_reports_user_sender_idx" ON "sender_reports" ("user_id","sender_hash");--> statement-breakpoint
CREATE INDEX "sender_reports_sender_idx" ON "sender_reports" ("sender_hash");--> statement-breakpoint
CREATE INDEX "sender_reports_domain_idx" ON "sender_reports" ("domain_hash");--> statement-breakpoint
ALTER TABLE "sender_reports" ADD CONSTRAINT "sender_reports_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;