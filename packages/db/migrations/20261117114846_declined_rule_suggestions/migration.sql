CREATE TABLE "declined_rule_suggestions" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"sender_hash" text NOT NULL,
	"user_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "declined_rule_suggestions_user_sender_idx" ON "declined_rule_suggestions" ("user_id","sender_hash");--> statement-breakpoint
ALTER TABLE "declined_rule_suggestions" ADD CONSTRAINT "declined_rule_suggestions_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;