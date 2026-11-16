CREATE TABLE "commitment_events" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"by" text NOT NULL,
	"commitment_id" uuid NOT NULL,
	"from" text,
	"message_id" uuid,
	"to" text NOT NULL,
	"user_id" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "commitments" ADD COLUMN "edited_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "commitments" ADD COLUMN "evidence_message_id" uuid;--> statement-breakpoint
ALTER TABLE "commitments" ADD COLUMN "reminded_at" timestamp with time zone;--> statement-breakpoint
CREATE INDEX "commitment_events_commitment_idx" ON "commitment_events" ("commitment_id");--> statement-breakpoint
CREATE INDEX "commitments_user_thread_idx" ON "commitments" ("user_id","thread_id");--> statement-breakpoint
ALTER TABLE "commitment_events" ADD CONSTRAINT "commitment_events_commitment_id_commitments_id_fkey" FOREIGN KEY ("commitment_id") REFERENCES "commitments"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "commitment_events" ADD CONSTRAINT "commitment_events_message_id_messages_id_fkey" FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "commitment_events" ADD CONSTRAINT "commitment_events_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "commitments" ADD CONSTRAINT "commitments_evidence_message_id_messages_id_fkey" FOREIGN KEY ("evidence_message_id") REFERENCES "messages"("id") ON DELETE SET NULL;--> statement-breakpoint
UPDATE "commitments" SET "reminded_at" = "updated_at" WHERE "status" IN ('reminded', 'done');--> statement-breakpoint
INSERT INTO "commitment_events" ("id", "by", "commitment_id", "from", "message_id", "to", "user_id", "created_at", "updated_at")
SELECT gen_random_uuid(), 'agent', "id", NULL, "message_id", 'open', "user_id", "created_at", "created_at" FROM "commitments";--> statement-breakpoint
INSERT INTO "commitment_events" ("id", "by", "commitment_id", "from", "message_id", "to", "user_id", "created_at", "updated_at")
SELECT gen_random_uuid(), CASE WHEN "kind" = 'theirs' THEN 'agent' ELSE 'user' END, "id", 'open', NULL, CASE WHEN "kind" = 'theirs' THEN 'acknowledged' ELSE 'fulfilled' END, "user_id", "updated_at", "updated_at" FROM "commitments" WHERE "status" = 'done';--> statement-breakpoint
UPDATE "commitments" SET "status" = CASE "status" WHEN 'reminded' THEN 'open' WHEN 'done' THEN CASE WHEN "kind" = 'theirs' THEN 'acknowledged' ELSE 'fulfilled' END ELSE "status" END;
