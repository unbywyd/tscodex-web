CREATE TABLE "room_messages" (
	"id" text PRIMARY KEY NOT NULL,
	"room_id_hash" text NOT NULL,
	"seq" integer NOT NULL,
	"sender" text NOT NULL,
	"content" text NOT NULL,
	"nonce" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rooms" (
	"id_hash" text PRIMARY KEY NOT NULL,
	"owner_key_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "room_messages" ADD CONSTRAINT "room_messages_room_id_hash_rooms_id_hash_fk" FOREIGN KEY ("room_id_hash") REFERENCES "public"."rooms"("id_hash") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "room_messages_seq_idx" ON "room_messages" USING btree ("room_id_hash","seq");--> statement-breakpoint
CREATE INDEX "rooms_expires_idx" ON "rooms" USING btree ("expires_at");