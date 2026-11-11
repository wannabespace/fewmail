CREATE TABLE "bulk_prints" (
	"band0" integer NOT NULL,
	"band1" integer NOT NULL,
	"band2" integer NOT NULL,
	"band3" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"print" text NOT NULL,
	"user_hash" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "commitments" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"due_at" timestamp with time zone NOT NULL,
	"message_id" uuid,
	"promise" text NOT NULL,
	"recipient" text,
	"status" text NOT NULL,
	"thread_id" text NOT NULL,
	"user_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "domain_sightings" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"domain" text,
	"user_hash" text,
	CONSTRAINT "domain_sightings_pkey" PRIMARY KEY("domain","user_hash")
);
--> statement-breakpoint
CREATE TABLE "payment_details" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"detail_hash" text,
	"sender_domain" text,
	"user_id" uuid,
	CONSTRAINT "payment_details_pkey" PRIMARY KEY("user_id","sender_domain","detail_hash")
);
--> statement-breakpoint
CREATE TABLE "people" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"email" text NOT NULL,
	"note" text,
	"note_updated_at" timestamp with time zone,
	"user_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"autonomy" text NOT NULL,
	"goal" text NOT NULL,
	"status" text NOT NULL,
	"summary" text,
	"thread_id" text NOT NULL,
	"user_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"amount_cents" integer NOT NULL,
	"charged_at" timestamp with time zone NOT NULL,
	"currency" text NOT NULL,
	"due_at" timestamp with time zone,
	"kind" text NOT NULL,
	"merchant" text NOT NULL,
	"message_id" uuid NOT NULL UNIQUE,
	"period" text,
	"user_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "unsubscribes" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ignored_at" timestamp with time zone,
	"sender_hash" text NOT NULL,
	"user_id" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "actions" ADD COLUMN "payload" jsonb;--> statement-breakpoint
ALTER TABLE "actions" ADD COLUMN "visible_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "bulk_count" integer;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "reply_to" text;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "risk" jsonb;--> statement-breakpoint
CREATE INDEX "bulk_prints_band0_idx" ON "bulk_prints" ("band0");--> statement-breakpoint
CREATE INDEX "bulk_prints_band1_idx" ON "bulk_prints" ("band1");--> statement-breakpoint
CREATE INDEX "bulk_prints_band2_idx" ON "bulk_prints" ("band2");--> statement-breakpoint
CREATE INDEX "bulk_prints_band3_idx" ON "bulk_prints" ("band3");--> statement-breakpoint
CREATE INDEX "commitments_due_idx" ON "commitments" ("status","due_at");--> statement-breakpoint
CREATE INDEX "domain_sightings_domain_idx" ON "domain_sightings" ("domain");--> statement-breakpoint
CREATE UNIQUE INDEX "people_user_email_idx" ON "people" ("user_id","email");--> statement-breakpoint
CREATE INDEX "tasks_user_thread_idx" ON "tasks" ("user_id","thread_id");--> statement-breakpoint
CREATE INDEX "transactions_user_merchant_idx" ON "transactions" ("user_id","merchant");--> statement-breakpoint
CREATE UNIQUE INDEX "unsubscribes_user_sender_idx" ON "unsubscribes" ("user_id","sender_hash");--> statement-breakpoint
CREATE INDEX "unsubscribes_sender_idx" ON "unsubscribes" ("sender_hash");--> statement-breakpoint
ALTER TABLE "commitments" ADD CONSTRAINT "commitments_message_id_messages_id_fkey" FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "commitments" ADD CONSTRAINT "commitments_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "payment_details" ADD CONSTRAINT "payment_details_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "people" ADD CONSTRAINT "people_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_message_id_messages_id_fkey" FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "unsubscribes" ADD CONSTRAINT "unsubscribes_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;