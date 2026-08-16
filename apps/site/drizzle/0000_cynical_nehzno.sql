CREATE TABLE "thanks" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"from" text,
	"message" text NOT NULL,
	"approved_at" timestamp with time zone,
	"rejected_at" timestamp with time zone,
	"moderation_token" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "thanks_approved_idx" ON "thanks" USING btree ("approved_at");--> statement-breakpoint
CREATE INDEX "thanks_token_idx" ON "thanks" USING btree ("moderation_token");