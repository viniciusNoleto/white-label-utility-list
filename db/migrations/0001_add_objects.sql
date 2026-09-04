CREATE TABLE "objects" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" varchar(100) NOT NULL,
	"name" varchar(150) NOT NULL,
	CONSTRAINT "objects_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "object_fields" (
	"id" serial PRIMARY KEY NOT NULL,
	"object_id" integer NOT NULL,
	"key" varchar(100) NOT NULL,
	"label" varchar(150) NOT NULL,
	"type" varchar(20) NOT NULL,
	"required" boolean DEFAULT false NOT NULL,
	"internal_list_id" integer,
	"position" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "list_fields" ADD COLUMN "object_id" integer;
--> statement-breakpoint
ALTER TABLE "list_fields" DROP COLUMN "person_config";
--> statement-breakpoint
ALTER TABLE "object_fields" ADD CONSTRAINT "object_fields_object_id_objects_id_fk" FOREIGN KEY ("object_id") REFERENCES "public"."objects"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "object_fields" ADD CONSTRAINT "object_fields_internal_list_id_internal_lists_id_fk" FOREIGN KEY ("internal_list_id") REFERENCES "public"."internal_lists"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "list_fields" ADD CONSTRAINT "list_fields_object_id_objects_id_fk" FOREIGN KEY ("object_id") REFERENCES "public"."objects"("id") ON DELETE no action ON UPDATE no action;
