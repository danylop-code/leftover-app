CREATE TABLE `favorites` (
	`user_id` text NOT NULL,
	`store_id` text NOT NULL,
	`created_at` text NOT NULL,
	PRIMARY KEY(`user_id`, `store_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `reviews` (
	`order_id` text PRIMARY KEY NOT NULL,
	`store_id` text NOT NULL,
	`user_id` text NOT NULL,
	`overall` integer NOT NULL,
	`quality` integer,
	`variety` integer,
	`freshness` integer,
	`ease` integer,
	`text` text DEFAULT '' NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "reviews_overall_range" CHECK("reviews"."overall" BETWEEN 1 AND 5)
);
--> statement-breakpoint
CREATE INDEX `reviews_store_created_idx` ON `reviews` (`store_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `orders_store_code_idx` ON `orders` (`store_id`,`code`);