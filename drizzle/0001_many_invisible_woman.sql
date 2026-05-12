CREATE TABLE `categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`nameEn` varchar(255),
	`parentId` int,
	`sortOrder` int DEFAULT 0,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `categories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `customers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`phone` varchar(32),
	`email` varchar(320),
	`city` varchar(128),
	`address` text,
	`notes` text,
	`points` int DEFAULT 0,
	`totalSpent` decimal(12,2) DEFAULT '0.00',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `customers_id` PRIMARY KEY(`id`),
	CONSTRAINT `customers_phone_unique` UNIQUE(`phone`)
);
--> statement-breakpoint
CREATE TABLE `discounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`nameEn` varchar(255),
	`type` enum('percentage','fixed') NOT NULL,
	`value` decimal(10,2) NOT NULL,
	`minAmount` decimal(10,2) DEFAULT '0.00',
	`maxUses` int,
	`usedCount` int DEFAULT 0,
	`isActive` boolean NOT NULL DEFAULT true,
	`startDate` timestamp,
	`endDate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `discounts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `invoice_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`invoiceId` int NOT NULL,
	`productId` int,
	`productName` varchar(255) NOT NULL,
	`productNameEn` varchar(255),
	`barcode` varchar(64),
	`color` varchar(64),
	`size` varchar(32),
	`qty` int NOT NULL,
	`unitPrice` decimal(10,2) NOT NULL,
	`discountPct` decimal(5,2) DEFAULT '0.00',
	`lineTotal` decimal(12,2) NOT NULL,
	CONSTRAINT `invoice_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `invoices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`invoiceNumber` varchar(32) NOT NULL,
	`customerId` int,
	`customerName` varchar(255),
	`customerPhone` varchar(32),
	`warehouseId` int,
	`subtotal` decimal(12,2) NOT NULL,
	`discountType` enum('percentage','fixed','none') DEFAULT 'none',
	`discountValue` decimal(10,2) DEFAULT '0.00',
	`discountAmount` decimal(10,2) DEFAULT '0.00',
	`discountId` int,
	`taxRate` decimal(5,2) DEFAULT '0.00',
	`taxAmount` decimal(10,2) DEFAULT '0.00',
	`total` decimal(12,2) NOT NULL,
	`paymentMethod` enum('cash','card','transfer','electronic','mixed') DEFAULT 'cash',
	`paymentStatus` enum('paid','pending','partial','refunded') DEFAULT 'paid',
	`status` enum('completed','cancelled','returned') DEFAULT 'completed',
	`notes` text,
	`token` varchar(64),
	`mfInvoiceId` varchar(128),
	`mfPaymentUrl` text,
	`mfQrCode` text,
	`mfStatus` varchar(32),
	`whatsappSent` boolean DEFAULT false,
	`whatsappSentAt` timestamp,
	`cashierId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `invoices_id` PRIMARY KEY(`id`),
	CONSTRAINT `invoices_invoiceNumber_unique` UNIQUE(`invoiceNumber`),
	CONSTRAINT `invoices_token_unique` UNIQUE(`token`)
);
--> statement-breakpoint
CREATE TABLE `product_stock` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` int NOT NULL,
	`warehouseId` int NOT NULL,
	`qty` int NOT NULL DEFAULT 0,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `product_stock_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sku` varchar(64),
	`barcode` varchar(64),
	`name` varchar(255) NOT NULL,
	`nameEn` varchar(255),
	`description` text,
	`descriptionEn` text,
	`categoryId` int,
	`color` varchar(64),
	`colorEn` varchar(64),
	`colorHex` varchar(16),
	`size` varchar(32),
	`costPrice` decimal(10,2) DEFAULT '0.00',
	`salePrice` decimal(10,2) NOT NULL,
	`images` json DEFAULT ('[]'),
	`isActive` boolean NOT NULL DEFAULT true,
	`lowStockAlert` int DEFAULT 5,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `products_id` PRIMARY KEY(`id`),
	CONSTRAINT `products_sku_unique` UNIQUE(`sku`),
	CONSTRAINT `products_barcode_unique` UNIQUE(`barcode`)
);
--> statement-breakpoint
CREATE TABLE `return_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`returnId` int NOT NULL,
	`productId` int,
	`productName` varchar(255) NOT NULL,
	`barcode` varchar(64),
	`color` varchar(64),
	`size` varchar(32),
	`qty` int NOT NULL,
	`unitPrice` decimal(10,2) NOT NULL,
	`lineTotal` decimal(12,2) NOT NULL,
	CONSTRAINT `return_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `returns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`returnNumber` varchar(32) NOT NULL,
	`invoiceId` int NOT NULL,
	`invoiceNumber` varchar(32),
	`customerId` int,
	`customerName` varchar(255),
	`warehouseId` int,
	`refundAmount` decimal(12,2) NOT NULL,
	`refundMethod` enum('cash','card','transfer','credit') DEFAULT 'cash',
	`reason` text,
	`status` enum('completed','pending') DEFAULT 'completed',
	`processedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `returns_id` PRIMARY KEY(`id`),
	CONSTRAINT `returns_returnNumber_unique` UNIQUE(`returnNumber`)
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`storeName` varchar(255) DEFAULT 'Darin Madani Fashion House',
	`storeNameEn` varchar(255) DEFAULT 'Darin Madani Fashion House',
	`storePhone` varchar(32),
	`storeEmail` varchar(255),
	`storeAddress` text,
	`storeAddressEn` text,
	`storeLogo` text,
	`taxNumber` varchar(64),
	`taxRate` decimal(5,2) DEFAULT '15.00',
	`currency` varchar(8) DEFAULT 'SAR',
	`currencySymbol` varchar(8) DEFAULT 'ر.س',
	`invoiceNote` text,
	`invoiceNoteEn` text,
	`whatsappEnabled` boolean DEFAULT false,
	`whatsappInstance` varchar(128),
	`whatsappApiKey` varchar(255),
	`whatsappApiBase` varchar(255) DEFAULT 'https://elv.academy-smart.com',
	`whatsappTemplate` text,
	`myfatoorahEnabled` boolean DEFAULT false,
	`myfatoorahToken` text,
	`myfatoorahEnv` enum('sandbox','live') DEFAULT 'sandbox',
	`myfatoorahSupplier` varchar(64),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `settings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `stock_movements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` int NOT NULL,
	`warehouseId` int NOT NULL,
	`toWarehouseId` int,
	`type` enum('purchase','sale','return','transfer','adjustment') NOT NULL,
	`qty` int NOT NULL,
	`costPrice` decimal(10,2),
	`reference` varchar(128),
	`notes` text,
	`userId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `stock_movements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_permissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`module` varchar(64) NOT NULL,
	`action` varchar(64) NOT NULL,
	`allowed` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_permissions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `warehouses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`nameEn` varchar(255),
	`description` text,
	`isDefault` boolean NOT NULL DEFAULT false,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `warehouses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('admin','manager','cashier','warehouse') NOT NULL DEFAULT 'cashier';--> statement-breakpoint
ALTER TABLE `users` ADD `username` varchar(64);--> statement-breakpoint
ALTER TABLE `users` ADD `nameEn` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `phone` varchar(32);--> statement-breakpoint
ALTER TABLE `users` ADD `passwordHash` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `isActive` boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `language` enum('ar','en') DEFAULT 'ar' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_username_unique` UNIQUE(`username`);