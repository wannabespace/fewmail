CREATE TABLE "board_entries" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"amount_cents" integer,
	"board_id" uuid NOT NULL,
	"currency" text,
	"group" text,
	"message_id" uuid NOT NULL,
	"occurred_at" timestamp with time zone NOT NULL,
	"status" text,
	"title" text NOT NULL,
	"user_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "boards" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"charts" text NOT NULL,
	"description" text NOT NULL,
	"gmail_query" text NOT NULL,
	"history_read_at" timestamp with time zone,
	"name" text NOT NULL,
	"user_id" uuid NOT NULL
);
--> statement-breakpoint
DROP TABLE "transactions";--> statement-breakpoint
ALTER TABLE "mailboxes" ADD COLUMN "boards_seeded_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "mailboxes" DROP COLUMN "money_history_at";--> statement-breakpoint
CREATE UNIQUE INDEX "board_entries_board_message_idx" ON "board_entries" ("board_id","message_id");--> statement-breakpoint
CREATE INDEX "boards_user_idx" ON "boards" ("user_id");--> statement-breakpoint
ALTER TABLE "board_entries" ADD CONSTRAINT "board_entries_board_id_boards_id_fkey" FOREIGN KEY ("board_id") REFERENCES "boards"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "board_entries" ADD CONSTRAINT "board_entries_message_id_messages_id_fkey" FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "board_entries" ADD CONSTRAINT "board_entries_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "boards" ADD CONSTRAINT "boards_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
DELETE FROM "actions" WHERE "kind" = 'subscription';