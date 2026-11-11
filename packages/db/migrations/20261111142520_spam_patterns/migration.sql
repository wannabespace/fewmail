CREATE TABLE "domain_ages" (
	"checked_at" timestamp with time zone DEFAULT now() NOT NULL,
	"domain" text PRIMARY KEY,
	"registered_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "pattern_reports" (
	"hash" text,
	"kind" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"user_hash" text,
	"verdict" text NOT NULL,
	CONSTRAINT "pattern_reports_pkey" PRIMARY KEY("user_hash","kind","hash")
);
--> statement-breakpoint
CREATE TABLE "template_reports" (
	"band0" integer NOT NULL,
	"band1" integer NOT NULL,
	"band2" integer NOT NULL,
	"band3" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"print" text,
	"user_hash" text,
	"verdict" text NOT NULL,
	CONSTRAINT "template_reports_pkey" PRIMARY KEY("user_hash","print")
);
--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "auth" jsonb;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "infra_hash" text;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "suspicion" smallint;--> statement-breakpoint
CREATE INDEX "pattern_reports_hash_idx" ON "pattern_reports" ("kind","hash");--> statement-breakpoint
CREATE INDEX "template_reports_band0_idx" ON "template_reports" ("band0");--> statement-breakpoint
CREATE INDEX "template_reports_band1_idx" ON "template_reports" ("band1");--> statement-breakpoint
CREATE INDEX "template_reports_band2_idx" ON "template_reports" ("band2");--> statement-breakpoint
CREATE INDEX "template_reports_band3_idx" ON "template_reports" ("band3");