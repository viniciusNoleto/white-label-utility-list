ALTER TABLE "internal_lists" ADD COLUMN "display_style" varchar(20) DEFAULT 'text' NOT NULL;--> statement-breakpoint
ALTER TABLE "internal_list_items" ADD COLUMN "color" varchar(20);