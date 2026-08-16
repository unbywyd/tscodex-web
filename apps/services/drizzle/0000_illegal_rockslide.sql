CREATE TABLE "clients" (
	"id" text PRIMARY KEY NOT NULL,
	"app" text NOT NULL,
	"name" text DEFAULT '' NOT NULL,
	"key_hash" text NOT NULL,
	"daily_token_limit" integer,
	"revoked_at" timestamp with time zone,
	"last_used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "usage" (
	"id" text PRIMARY KEY NOT NULL,
	"client_id" text NOT NULL,
	"provider" text NOT NULL,
	"model" text NOT NULL,
	"input_tokens" integer DEFAULT 0 NOT NULL,
	"output_tokens" integer DEFAULT 0 NOT NULL,
	"error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "usage" ADD CONSTRAINT "usage_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "clients_key_hash_idx" ON "clients" USING btree ("key_hash");--> statement-breakpoint
CREATE INDEX "clients_app_idx" ON "clients" USING btree ("app");--> statement-breakpoint
CREATE INDEX "usage_client_created_idx" ON "usage" USING btree ("client_id","created_at");--> statement-breakpoint
CREATE INDEX "usage_created_idx" ON "usage" USING btree ("created_at");