CREATE TYPE "public"."vinyl_status" AS ENUM('in_collection', 'recommended');--> statement-breakpoint
CREATE TABLE "telemetry_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_type" varchar(255) NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vinyls" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"discogs_id" integer,
	"title" varchar(255) NOT NULL,
	"artist" varchar(255) NOT NULL,
	"year" integer NOT NULL,
	"cover_url" varchar(500),
	"status" "vinyl_status" DEFAULT 'recommended' NOT NULL,
	"genre" varchar(255),
	"is_now_spinning" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "telemetry_events_event_type_idx" ON "telemetry_events" USING btree ("event_type");--> statement-breakpoint
CREATE UNIQUE INDEX "vinyls_discogs_id_idx" ON "vinyls" USING btree ("discogs_id");--> statement-breakpoint
CREATE INDEX "vinyls_artist_idx" ON "vinyls" USING btree ("artist");