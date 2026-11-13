CREATE TABLE "ai_usage" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"cache_read_tokens" integer DEFAULT 0 NOT NULL,
	"cache_write_tokens" integer DEFAULT 0 NOT NULL,
	"cost" numeric(12,8),
	"feature" text NOT NULL,
	"input_tokens" integer DEFAULT 0 NOT NULL,
	"model" text NOT NULL,
	"output_tokens" integer DEFAULT 0 NOT NULL,
	"user_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE INDEX "ai_usage_user_id_created_at_index" ON "ai_usage" ("user_id","created_at");--> statement-breakpoint
ALTER TABLE "ai_usage" ADD CONSTRAINT "ai_usage_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;