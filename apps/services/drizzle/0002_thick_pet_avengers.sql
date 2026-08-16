CREATE TABLE "invite_codes" (
	"code_hash" text PRIMARY KEY NOT NULL,
	"payload" text NOT NULL,
	"nonce" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "invite_codes_expires_idx" ON "invite_codes" USING btree ("expires_at");