CREATE TABLE "subscriptions" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"cancel_at_period_end" boolean DEFAULT false NOT NULL,
	"period_end" timestamp with time zone,
	"status" text NOT NULL,
	"stripe_price_id" text NOT NULL,
	"stripe_subscription_id" text NOT NULL UNIQUE,
	"user_id" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "rules" ADD COLUMN "match" jsonb;--> statement-breakpoint
ALTER TABLE "user_settings" ADD COLUMN "trial_ends_at" timestamp with time zone DEFAULT now() + interval '14 days' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "stripe_customer_id" text;--> statement-breakpoint
ALTER TABLE "rules" ALTER COLUMN "instruction" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;