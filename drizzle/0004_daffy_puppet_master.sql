CREATE TABLE `offer_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`offerId` int NOT NULL,
	`eventType` enum('view','click') NOT NULL,
	`sessionId` varchar(128),
	`referrer` varchar(512),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `offer_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sitemap_meta` (
	`id` int AUTO_INCREMENT NOT NULL,
	`generatedAt` timestamp NOT NULL DEFAULT (now()),
	`urlCount` int DEFAULT 0,
	`triggeredBy` enum('manual','scheduled') NOT NULL DEFAULT 'manual',
	`scheduleCronTaskUid` varchar(65),
	CONSTRAINT `sitemap_meta_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `idx_offer_events_offer` ON `offer_events` (`offerId`);--> statement-breakpoint
CREATE INDEX `idx_offer_events_type` ON `offer_events` (`eventType`);--> statement-breakpoint
CREATE INDEX `idx_offer_events_created` ON `offer_events` (`createdAt`);