CREATE TABLE `articles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(255) NOT NULL,
	`title` varchar(255) NOT NULL,
	`metaTitle` varchar(255),
	`metaDescription` text,
	`excerpt` text,
	`content` text,
	`categoryId` int,
	`tags` json,
	`isPillar` boolean NOT NULL DEFAULT false,
	`status` enum('draft','published','archived') NOT NULL DEFAULT 'draft',
	`author` varchar(128) DEFAULT 'Editorial Team',
	`wordCount` int DEFAULT 0,
	`hasDisclosure` boolean NOT NULL DEFAULT true,
	`featuredImageUrl` text,
	`publishedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `articles_id` PRIMARY KEY(`id`),
	CONSTRAINT `articles_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `audit_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`action` varchar(64) NOT NULL,
	`entityType` varchar(64) NOT NULL,
	`entityId` int,
	`entitySlug` varchar(255),
	`beforeState` json,
	`afterState` json,
	`triggeredBy` varchar(128) DEFAULT 'system',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `audit_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(128) NOT NULL,
	`name` varchar(128) NOT NULL,
	`description` text,
	`metaTitle` varchar(255),
	`metaDescription` text,
	`icon` varchar(64),
	`sortOrder` int DEFAULT 0,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `categories_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `content_jobs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`jobType` enum('generate_summary','generate_article','refresh_offers','site_audit','update_sitemap','flag_stale') NOT NULL,
	`status` enum('pending','running','completed','failed') NOT NULL DEFAULT 'pending',
	`targetSlug` varchar(255),
	`payload` json,
	`result` text,
	`errorLog` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	CONSTRAINT `content_jobs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `offer_page_map` (
	`id` int AUTO_INCREMENT NOT NULL,
	`offerId` int NOT NULL,
	`pageSlug` varchar(255) NOT NULL,
	`position` int DEFAULT 0,
	`isFeatured` boolean NOT NULL DEFAULT false,
	CONSTRAINT `offer_page_map_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `offers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`providerId` int NOT NULL,
	`categoryId` int NOT NULL,
	`slug` varchar(128) NOT NULL,
	`productName` varchar(255) NOT NULL,
	`tagline` varchar(255),
	`aprMin` decimal(5,2),
	`aprMax` decimal(5,2),
	`annualFee` decimal(8,2),
	`feeStructure` text,
	`rewardsRate` varchar(128),
	`bonusDetails` text,
	`minCreditScore` int,
	`maxLoanAmount` decimal(12,2),
	`minLoanAmount` decimal(12,2),
	`termMin` int,
	`termMax` int,
	`pros` json,
	`cons` json,
	`editorialSummary` text,
	`overallRating` decimal(3,1),
	`trackingUrl` text,
	`source` varchar(64) DEFAULT 'manual',
	`sourceId` varchar(128),
	`isFeatured` boolean NOT NULL DEFAULT false,
	`isActive` boolean NOT NULL DEFAULT true,
	`lastVerifiedAt` timestamp DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `offers_id` PRIMARY KEY(`id`),
	CONSTRAINT `offers_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `pages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(128) NOT NULL,
	`title` varchar(255) NOT NULL,
	`metaTitle` varchar(255),
	`metaDescription` text,
	`content` text,
	`status` enum('draft','published') NOT NULL DEFAULT 'published',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pages_id` PRIMARY KEY(`id`),
	CONSTRAINT `pages_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `providers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(128) NOT NULL,
	`name` varchar(128) NOT NULL,
	`logoUrl` text,
	`websiteUrl` text,
	`description` text,
	`editorialSummary` text,
	`foundedYear` int,
	`headquarters` varchar(128),
	`overallRating` decimal(3,1),
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `providers_id` PRIMARY KEY(`id`),
	CONSTRAINT `providers_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE INDEX `idx_articles_status` ON `articles` (`status`);--> statement-breakpoint
CREATE INDEX `idx_articles_category` ON `articles` (`categoryId`);--> statement-breakpoint
CREATE INDEX `idx_audit_entity` ON `audit_log` (`entityType`,`entityId`);--> statement-breakpoint
CREATE INDEX `idx_offers_category` ON `offers` (`categoryId`);--> statement-breakpoint
CREATE INDEX `idx_offers_provider` ON `offers` (`providerId`);--> statement-breakpoint
CREATE INDEX `idx_offers_active` ON `offers` (`isActive`);