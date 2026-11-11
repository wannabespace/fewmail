ALTER TABLE "mailboxes" DROP CONSTRAINT "mailboxes_user_id_key";--> statement-breakpoint
ALTER TABLE "mailboxes" ADD COLUMN "google_account_id" text;--> statement-breakpoint
ALTER TABLE "mailboxes" ADD COLUMN "refresh_token" text;--> statement-breakpoint
ALTER TABLE "outbox" ADD COLUMN "mailbox_id" uuid;--> statement-breakpoint
UPDATE "outbox" SET "mailbox_id" = "mailboxes"."id" FROM "mailboxes" WHERE "mailboxes"."user_id" = "outbox"."user_id";--> statement-breakpoint
DELETE FROM "outbox" WHERE "mailbox_id" IS NULL;--> statement-breakpoint
ALTER TABLE "outbox" ALTER COLUMN "mailbox_id" SET NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "mailboxes_user_sign_in_idx" ON "mailboxes" ("user_id") WHERE "google_account_id" is null;--> statement-breakpoint
CREATE UNIQUE INDEX "mailboxes_user_google_idx" ON "mailboxes" ("user_id","google_account_id");--> statement-breakpoint
ALTER TABLE "outbox" ADD CONSTRAINT "outbox_mailbox_id_mailboxes_id_fkey" FOREIGN KEY ("mailbox_id") REFERENCES "mailboxes"("id") ON DELETE CASCADE;