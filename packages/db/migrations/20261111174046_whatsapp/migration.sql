CREATE TABLE "whatsapp_links" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_inbound_at" timestamp with time zone,
	"link_code" text NOT NULL UNIQUE,
	"linked_at" timestamp with time zone,
	"phone" text UNIQUE,
	"user_id" uuid PRIMARY KEY
);
--> statement-breakpoint
ALTER TABLE "whatsapp_links" ADD CONSTRAINT "whatsapp_links_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;