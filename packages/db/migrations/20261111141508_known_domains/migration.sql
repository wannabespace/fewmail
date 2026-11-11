CREATE TABLE "known_domains" (
	"domain" text,
	"list" text,
	"rank" integer,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "known_domains_pkey" PRIMARY KEY("list","domain")
);
--> statement-breakpoint
CREATE INDEX "known_domains_domain_idx" ON "known_domains" ("domain");