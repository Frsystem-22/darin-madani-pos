CREATE TABLE `barcode_serials` (
	`id` int AUTO_INCREMENT NOT NULL,
	`variantBarcode` varchar(128) NOT NULL,
	`lastSerial` int NOT NULL DEFAULT 0,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `barcode_serials_id` PRIMARY KEY(`id`),
	CONSTRAINT `barcode_serials_variantBarcode_unique` UNIQUE(`variantBarcode`)
);
