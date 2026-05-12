CREATE TABLE `invoice_payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`invoiceId` int NOT NULL,
	`method` enum('cash','card','transfer','electronic') NOT NULL DEFAULT 'cash',
	`amount` decimal(12,2) NOT NULL,
	`reference` varchar(128),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `invoice_payments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payment_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`token` varchar(64) NOT NULL,
	`cartJson` text NOT NULL,
	`customerId` int,
	`customerName` varchar(255),
	`customerPhone` varchar(32),
	`warehouseId` int,
	`cashierId` int,
	`subtotal` decimal(12,2) NOT NULL,
	`discountAmount` decimal(10,2) DEFAULT '0.00',
	`taxRate` decimal(5,2) DEFAULT '0.00',
	`taxAmount` decimal(10,2) DEFAULT '0.00',
	`total` decimal(12,2) NOT NULL,
	`discountType` varchar(32),
	`discountValue` decimal(10,2) DEFAULT '0.00',
	`discountId` int,
	`notes` text,
	`mfInvoiceId` varchar(128),
	`mfPaymentUrl` text,
	`mfQrCode` text,
	`mfStatus` varchar(32) DEFAULT 'pending',
	`invoiceId` int,
	`status` enum('pending','paid','failed','expired') DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payment_requests_id` PRIMARY KEY(`id`),
	CONSTRAINT `payment_requests_token_unique` UNIQUE(`token`)
);
--> statement-breakpoint
ALTER TABLE `settings` ADD `priceIncludesTax` boolean DEFAULT false;