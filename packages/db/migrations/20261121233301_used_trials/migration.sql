CREATE TABLE "used_trials" (
	"address_hash" text PRIMARY KEY,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
