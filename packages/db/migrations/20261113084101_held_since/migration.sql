ALTER TABLE "mailboxes" ADD COLUMN "held_since" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
UPDATE "mailboxes" SET "held_since" = "created_at";
