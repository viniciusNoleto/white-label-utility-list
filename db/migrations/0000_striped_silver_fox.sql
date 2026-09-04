CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(150) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"role" varchar(20) DEFAULT 'user' NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"token_hash" varchar(64) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "sessions_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "internal_lists" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" varchar(100) NOT NULL,
	"name" varchar(150) NOT NULL,
	CONSTRAINT "internal_lists_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "internal_list_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"list_id" integer NOT NULL,
	"label" varchar(255) NOT NULL,
	"position" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "list_fields" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" varchar(100) NOT NULL,
	"label" varchar(150) NOT NULL,
	"type" varchar(20) NOT NULL,
	"required" boolean DEFAULT false NOT NULL,
	"internal_list_id" integer,
	"person_config" jsonb,
	"position" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "list_fields_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "list_columns" (
	"id" serial PRIMARY KEY NOT NULL,
	"field_key" varchar(100) NOT NULL,
	"sub_path" varchar(50),
	"label" varchar(150) NOT NULL,
	"position" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "list_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"values" jsonb NOT NULL,
	"created_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "internal_list_items" ADD CONSTRAINT "internal_list_items_list_id_internal_lists_id_fk" FOREIGN KEY ("list_id") REFERENCES "public"."internal_lists"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "list_fields" ADD CONSTRAINT "list_fields_internal_list_id_internal_lists_id_fk" FOREIGN KEY ("internal_list_id") REFERENCES "public"."internal_lists"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "list_records" ADD CONSTRAINT "list_records_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;