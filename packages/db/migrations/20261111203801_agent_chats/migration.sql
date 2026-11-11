CREATE TABLE "chats" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"messages" text NOT NULL,
	"title" text NOT NULL,
	"user_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE INDEX "chats_user_idx" ON "chats" ("user_id","updated_at");--> statement-breakpoint
ALTER TABLE "chats" ADD CONSTRAINT "chats_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;