CREATE TABLE "list_sightings" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"list_hash" text,
	"user_hash" text,
	CONSTRAINT "list_sightings_pkey" PRIMARY KEY("list_hash","user_hash")
);
--> statement-breakpoint
ALTER TABLE "commitments" ADD COLUMN "kind" text DEFAULT 'mine' NOT NULL;