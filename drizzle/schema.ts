import {
  int, mysqlEnum, mysqlTable, text, timestamp,
  varchar, decimal, boolean, json, bigint
} from "drizzle-orm/mysql-core";

// ─── USERS & AUTH ──────────────────────────────────────────────────────────
export const users = mysqlTable("users", {
  id:           int("id").autoincrement().primaryKey(),
  openId:       varchar("openId", { length: 64 }).notNull().unique(),
  username:     varchar("username", { length: 64 }).unique(),
  name:         text("name"),
  nameEn:       varchar("nameEn", { length: 255 }),
  email:        varchar("email", { length: 320 }),
  phone:        varchar("phone", { length: 32 }),
  passwordHash: varchar("passwordHash", { length: 255 }),
  loginMethod:  varchar("loginMethod", { length: 64 }),
  role:         mysqlEnum("role", ["admin", "manager", "cashier", "warehouse"]).default("cashier").notNull(),
  isActive:     boolean("isActive").default(true).notNull(),
  language:     mysqlEnum("language", ["ar", "en"]).default("ar").notNull(),
  createdAt:    timestamp("createdAt").defaultNow().notNull(),
  updatedAt:    timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

// Granular permissions per user
export const userPermissions = mysqlTable("user_permissions", {
  id:         int("id").autoincrement().primaryKey(),
  userId:     int("userId").notNull(),
  module:     varchar("module", { length: 64 }).notNull(),   // e.g. "pos", "inventory"
  action:     varchar("action", { length: 64 }).notNull(),   // e.g. "view", "create", "edit", "delete"
  allowed:    boolean("allowed").default(false).notNull(),
  createdAt:  timestamp("createdAt").defaultNow().notNull(),
});

// ─── SETTINGS ──────────────────────────────────────────────────────────────
export const settings = mysqlTable("settings", {
  id:                   int("id").autoincrement().primaryKey(),
  storeName:            varchar("storeName", { length: 255 }).default("Darin Madani Fashion House"),
  storeNameEn:          varchar("storeNameEn", { length: 255 }).default("Darin Madani Fashion House"),
  storePhone:           varchar("storePhone", { length: 32 }),
  storeEmail:           varchar("storeEmail", { length: 255 }),
  storeAddress:         text("storeAddress"),
  storeAddressEn:       text("storeAddressEn"),
  storeLogo:            text("storeLogo"),
  taxNumber:            varchar("taxNumber", { length: 64 }),
  taxRate:              decimal("taxRate", { precision: 5, scale: 2 }).default("15.00"),
  currency:             varchar("currency", { length: 8 }).default("SAR"),
  currencySymbol:       varchar("currencySymbol", { length: 8 }).default("ر.س"),
  invoiceNote:          text("invoiceNote"),
  invoiceNoteEn:        text("invoiceNoteEn"),
  // WhatsApp (Evolution API)
  whatsappEnabled:      boolean("whatsappEnabled").default(false),
  whatsappInstance:     varchar("whatsappInstance", { length: 128 }),
  whatsappApiKey:       varchar("whatsappApiKey", { length: 255 }),
  whatsappApiBase:      varchar("whatsappApiBase", { length: 255 }).default("https://elv.academy-smart.com"),
  whatsappTemplate:     text("whatsappTemplate"),
  // MyFatoorah
  myfatoorahEnabled:    boolean("myfatoorahEnabled").default(false),
  myfatoorahToken:      text("myfatoorahToken"),
  myfatoorahEnv:        mysqlEnum("myfatoorahEnv", ["sandbox", "live"]).default("sandbox"),
  myfatoorahSupplier:   varchar("myfatoorahSupplier", { length: 64 }),
  updatedAt:            timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ─── WAREHOUSES ────────────────────────────────────────────────────────────
export const warehouses = mysqlTable("warehouses", {
  id:          int("id").autoincrement().primaryKey(),
  name:        varchar("name", { length: 255 }).notNull(),
  nameEn:      varchar("nameEn", { length: 255 }),
  description: text("description"),
  isDefault:   boolean("isDefault").default(false).notNull(),
  isActive:    boolean("isActive").default(true).notNull(),
  createdAt:   timestamp("createdAt").defaultNow().notNull(),
  updatedAt:   timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ─── CATEGORIES ────────────────────────────────────────────────────────────
export const categories = mysqlTable("categories", {
  id:        int("id").autoincrement().primaryKey(),
  name:      varchar("name", { length: 255 }).notNull(),
  nameEn:    varchar("nameEn", { length: 255 }),
  parentId:  int("parentId"),
  sortOrder: int("sortOrder").default(0),
  isActive:  boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── PRODUCTS ──────────────────────────────────────────────────────────────
export const products = mysqlTable("products", {
  id:          int("id").autoincrement().primaryKey(),
  sku:         varchar("sku", { length: 64 }).unique(),
  barcode:     varchar("barcode", { length: 64 }).unique(),
  name:        varchar("name", { length: 255 }).notNull(),
  nameEn:      varchar("nameEn", { length: 255 }),
  description: text("description"),
  descriptionEn: text("descriptionEn"),
  categoryId:  int("categoryId"),
  color:       varchar("color", { length: 64 }),
  colorEn:     varchar("colorEn", { length: 64 }),
  colorHex:    varchar("colorHex", { length: 16 }),
  size:        varchar("size", { length: 32 }),
  costPrice:   decimal("costPrice", { precision: 10, scale: 2 }).default("0.00"),
  salePrice:   decimal("salePrice", { precision: 10, scale: 2 }).notNull(),
  images:      json("images").$type<string[]>().default([]),
  isActive:    boolean("isActive").default(true).notNull(),
  lowStockAlert: int("lowStockAlert").default(5),
  createdAt:   timestamp("createdAt").defaultNow().notNull(),
  updatedAt:   timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// Stock per warehouse
export const productStock = mysqlTable("product_stock", {
  id:          int("id").autoincrement().primaryKey(),
  productId:   int("productId").notNull(),
  warehouseId: int("warehouseId").notNull(),
  qty:         int("qty").default(0).notNull(),
  updatedAt:   timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// Stock movements (purchases, transfers, adjustments)
export const stockMovements = mysqlTable("stock_movements", {
  id:            int("id").autoincrement().primaryKey(),
  productId:     int("productId").notNull(),
  warehouseId:   int("warehouseId").notNull(),
  toWarehouseId: int("toWarehouseId"),
  type:          mysqlEnum("type", ["purchase", "sale", "return", "transfer", "adjustment"]).notNull(),
  qty:           int("qty").notNull(),
  costPrice:     decimal("costPrice", { precision: 10, scale: 2 }),
  reference:     varchar("reference", { length: 128 }),
  notes:         text("notes"),
  userId:        int("userId"),
  createdAt:     timestamp("createdAt").defaultNow().notNull(),
});

// ─── CUSTOMERS ─────────────────────────────────────────────────────────────
export const customers = mysqlTable("customers", {
  id:        int("id").autoincrement().primaryKey(),
  name:      varchar("name", { length: 255 }).notNull(),
  phone:     varchar("phone", { length: 32 }).unique(),
  email:     varchar("email", { length: 320 }),
  city:      varchar("city", { length: 128 }),
  address:   text("address"),
  notes:     text("notes"),
  points:    int("points").default(0),
  totalSpent: decimal("totalSpent", { precision: 12, scale: 2 }).default("0.00"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ─── DISCOUNTS ─────────────────────────────────────────────────────────────
export const discounts = mysqlTable("discounts", {
  id:          int("id").autoincrement().primaryKey(),
  name:        varchar("name", { length: 255 }).notNull(),
  nameEn:      varchar("nameEn", { length: 255 }),
  type:        mysqlEnum("type", ["percentage", "fixed"]).notNull(),
  value:       decimal("value", { precision: 10, scale: 2 }).notNull(),
  minAmount:   decimal("minAmount", { precision: 10, scale: 2 }).default("0.00"),
  maxUses:     int("maxUses"),
  usedCount:   int("usedCount").default(0),
  isActive:    boolean("isActive").default(true).notNull(),
  startDate:   timestamp("startDate"),
  endDate:     timestamp("endDate"),
  createdAt:   timestamp("createdAt").defaultNow().notNull(),
});

// ─── INVOICES ──────────────────────────────────────────────────────────────
export const invoices = mysqlTable("invoices", {
  id:              int("id").autoincrement().primaryKey(),
  invoiceNumber:   varchar("invoiceNumber", { length: 32 }).notNull().unique(),
  customerId:      int("customerId"),
  customerName:    varchar("customerName", { length: 255 }),
  customerPhone:   varchar("customerPhone", { length: 32 }),
  warehouseId:     int("warehouseId"),
  subtotal:        decimal("subtotal", { precision: 12, scale: 2 }).notNull(),
  discountType:    mysqlEnum("discountType", ["percentage", "fixed", "none"]).default("none"),
  discountValue:   decimal("discountValue", { precision: 10, scale: 2 }).default("0.00"),
  discountAmount:  decimal("discountAmount", { precision: 10, scale: 2 }).default("0.00"),
  discountId:      int("discountId"),
  taxRate:         decimal("taxRate", { precision: 5, scale: 2 }).default("0.00"),
  taxAmount:       decimal("taxAmount", { precision: 10, scale: 2 }).default("0.00"),
  total:           decimal("total", { precision: 12, scale: 2 }).notNull(),
  paymentMethod:   mysqlEnum("paymentMethod", ["cash", "card", "transfer", "electronic", "mixed"]).default("cash"),
  paymentStatus:   mysqlEnum("paymentStatus", ["paid", "pending", "partial", "refunded"]).default("paid"),
  status:          mysqlEnum("status", ["completed", "cancelled", "returned"]).default("completed"),
  notes:           text("notes"),
  token:           varchar("token", { length: 64 }).unique(),
  // MyFatoorah
  mfInvoiceId:     varchar("mfInvoiceId", { length: 128 }),
  mfPaymentUrl:    text("mfPaymentUrl"),
  mfQrCode:        text("mfQrCode"),
  mfStatus:        varchar("mfStatus", { length: 32 }),
  // WhatsApp
  whatsappSent:    boolean("whatsappSent").default(false),
  whatsappSentAt:  timestamp("whatsappSentAt"),
  cashierId:       int("cashierId"),
  createdAt:       timestamp("createdAt").defaultNow().notNull(),
  updatedAt:       timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const invoiceItems = mysqlTable("invoice_items", {
  id:           int("id").autoincrement().primaryKey(),
  invoiceId:    int("invoiceId").notNull(),
  productId:    int("productId"),
  productName:  varchar("productName", { length: 255 }).notNull(),
  productNameEn: varchar("productNameEn", { length: 255 }),
  barcode:      varchar("barcode", { length: 64 }),
  color:        varchar("color", { length: 64 }),
  size:         varchar("size", { length: 32 }),
  qty:          int("qty").notNull(),
  unitPrice:    decimal("unitPrice", { precision: 10, scale: 2 }).notNull(),
  discountPct:  decimal("discountPct", { precision: 5, scale: 2 }).default("0.00"),
  lineTotal:    decimal("lineTotal", { precision: 12, scale: 2 }).notNull(),
});

// ─── RETURNS ───────────────────────────────────────────────────────────────
export const returns = mysqlTable("returns", {
  id:             int("id").autoincrement().primaryKey(),
  returnNumber:   varchar("returnNumber", { length: 32 }).notNull().unique(),
  invoiceId:      int("invoiceId").notNull(),
  invoiceNumber:  varchar("invoiceNumber", { length: 32 }),
  customerId:     int("customerId"),
  customerName:   varchar("customerName", { length: 255 }),
  warehouseId:    int("warehouseId"),
  refundAmount:   decimal("refundAmount", { precision: 12, scale: 2 }).notNull(),
  refundMethod:   mysqlEnum("refundMethod", ["cash", "card", "transfer", "credit"]).default("cash"),
  reason:         text("reason"),
  status:         mysqlEnum("status", ["completed", "pending"]).default("completed"),
  processedBy:    int("processedBy"),
  createdAt:      timestamp("createdAt").defaultNow().notNull(),
});

export const returnItems = mysqlTable("return_items", {
  id:          int("id").autoincrement().primaryKey(),
  returnId:    int("returnId").notNull(),
  productId:   int("productId"),
  productName: varchar("productName", { length: 255 }).notNull(),
  barcode:     varchar("barcode", { length: 64 }),
  color:       varchar("color", { length: 64 }),
  size:        varchar("size", { length: 32 }),
  qty:         int("qty").notNull(),
  unitPrice:   decimal("unitPrice", { precision: 10, scale: 2 }).notNull(),
  lineTotal:   decimal("lineTotal", { precision: 12, scale: 2 }).notNull(),
});

// ─── TYPES ─────────────────────────────────────────────────────────────────
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;
export type Customer = typeof customers.$inferSelect;
export type Invoice = typeof invoices.$inferSelect;
export type InvoiceItem = typeof invoiceItems.$inferSelect;
export type Return = typeof returns.$inferSelect;
export type Warehouse = typeof warehouses.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type StockMovement = typeof stockMovements.$inferSelect;
export type Discount = typeof discounts.$inferSelect;
export type Settings = typeof settings.$inferSelect;
