CREATE TABLE `bags` (
	`id` text PRIMARY KEY NOT NULL,
	`store_id` text NOT NULL,
	`title` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`category` text NOT NULL,
	`price_minor` integer NOT NULL,
	`original_price_minor` integer NOT NULL,
	`qty_total` integer NOT NULL,
	`qty_available` integer NOT NULL,
	`pickup_start` text NOT NULL,
	`pickup_end` text NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "bags_qty_available_range" CHECK("bags"."qty_available" >= 0 AND "bags"."qty_available" <= "bags"."qty_total"),
	CONSTRAINT "bags_price_non_negative" CHECK("bags"."price_minor" >= 0 AND "bags"."original_price_minor" >= 0)
);
--> statement-breakpoint
CREATE INDEX `bags_store_pickup_end_idx` ON `bags` (`store_id`,`pickup_end`);--> statement-breakpoint
CREATE TABLE `orders` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`bag_id` text NOT NULL,
	`store_id` text NOT NULL,
	`qty` integer NOT NULL,
	`unit_price_minor` integer NOT NULL,
	`unit_original_price_minor` integer NOT NULL,
	`code` text NOT NULL,
	`status` text DEFAULT 'reserved' NOT NULL,
	`created_at` text NOT NULL,
	`collected_at` text,
	`cancelled_at` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`bag_id`) REFERENCES `bags`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "orders_qty_positive" CHECK("orders"."qty" > 0)
);
--> statement-breakpoint
CREATE INDEX `orders_user_idx` ON `orders` (`user_id`);--> statement-breakpoint
CREATE INDEX `orders_bag_idx` ON `orders` (`bag_id`);--> statement-breakpoint
CREATE TABLE `sessions` (
	`token_hash` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`created_at` text NOT NULL,
	`expires_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `sessions_user_idx` ON `sessions` (`user_id`);--> statement-breakpoint
CREATE TABLE `stores` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`name` text NOT NULL,
	`category` text NOT NULL,
	`address` text NOT NULL,
	`lat` real NOT NULL,
	`lng` real NOT NULL,
	`opens_at` text NOT NULL,
	`closes_at` text NOT NULL,
	`timezone` text DEFAULT 'Europe/Kyiv' NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `stores_owner_id_unique` ON `stores` (`owner_id`);--> statement-breakpoint
CREATE INDEX `stores_lat_lng_idx` ON `stores` (`lat`,`lng`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`first_name` text NOT NULL,
	`role` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);