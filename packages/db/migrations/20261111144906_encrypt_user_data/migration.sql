ALTER TABLE "messages" ADD COLUMN "from_domain" text NOT NULL;--> statement-breakpoint
ALTER TABLE "actions" ALTER COLUMN "payload" SET DATA TYPE text USING "payload"::text;--> statement-breakpoint
ALTER TABLE "analyses" ALTER COLUMN "extracted" SET DATA TYPE text USING "extracted"::text;--> statement-breakpoint
ALTER TABLE "rules" ALTER COLUMN "match" SET DATA TYPE text USING "match"::text;