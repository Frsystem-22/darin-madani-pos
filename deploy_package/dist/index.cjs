"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc2) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc2 = __getOwnPropDesc(from, key)) || desc2.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server/_core/env.ts
var ENV;
var init_env = __esm({
  "server/_core/env.ts"() {
    "use strict";
    ENV = {
      appId: process.env.VITE_APP_ID ?? "",
      cookieSecret: process.env.JWT_SECRET ?? "",
      databaseUrl: process.env.DATABASE_URL ?? "",
      oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
      ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
      isProduction: process.env.NODE_ENV === "production",
      forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
      forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? ""
    };
  }
});

// drizzle/schema.ts
var import_mysql_core, users, userPermissions, settings, warehouses, categories, products, productStock, stockMovements, barcodeSerials, customers, discounts, invoices, invoiceItems, returns, returnItems, invoicePayments, paymentRequests;
var init_schema = __esm({
  "drizzle/schema.ts"() {
    "use strict";
    import_mysql_core = require("drizzle-orm/mysql-core");
    users = (0, import_mysql_core.mysqlTable)("users", {
      id: (0, import_mysql_core.int)("id").autoincrement().primaryKey(),
      openId: (0, import_mysql_core.varchar)("openId", { length: 64 }).notNull().unique(),
      username: (0, import_mysql_core.varchar)("username", { length: 64 }).unique(),
      name: (0, import_mysql_core.text)("name"),
      nameEn: (0, import_mysql_core.varchar)("nameEn", { length: 255 }),
      email: (0, import_mysql_core.varchar)("email", { length: 320 }),
      phone: (0, import_mysql_core.varchar)("phone", { length: 32 }),
      passwordHash: (0, import_mysql_core.varchar)("passwordHash", { length: 255 }),
      loginMethod: (0, import_mysql_core.varchar)("loginMethod", { length: 64 }),
      role: (0, import_mysql_core.mysqlEnum)("role", ["admin", "manager", "cashier", "warehouse"]).default("cashier").notNull(),
      isActive: (0, import_mysql_core.boolean)("isActive").default(true).notNull(),
      language: (0, import_mysql_core.mysqlEnum)("language", ["ar", "en"]).default("ar").notNull(),
      createdAt: (0, import_mysql_core.timestamp)("createdAt").defaultNow().notNull(),
      updatedAt: (0, import_mysql_core.timestamp)("updatedAt").defaultNow().onUpdateNow().notNull(),
      lastSignedIn: (0, import_mysql_core.timestamp)("lastSignedIn").defaultNow().notNull()
    });
    userPermissions = (0, import_mysql_core.mysqlTable)("user_permissions", {
      id: (0, import_mysql_core.int)("id").autoincrement().primaryKey(),
      userId: (0, import_mysql_core.int)("userId").notNull(),
      module: (0, import_mysql_core.varchar)("module", { length: 64 }).notNull(),
      // e.g. "pos", "inventory"
      action: (0, import_mysql_core.varchar)("action", { length: 64 }).notNull(),
      // e.g. "view", "create", "edit", "delete"
      allowed: (0, import_mysql_core.boolean)("allowed").default(false).notNull(),
      createdAt: (0, import_mysql_core.timestamp)("createdAt").defaultNow().notNull()
    });
    settings = (0, import_mysql_core.mysqlTable)("settings", {
      id: (0, import_mysql_core.int)("id").autoincrement().primaryKey(),
      storeName: (0, import_mysql_core.varchar)("storeName", { length: 255 }).default("Darin Madani Fashion House"),
      storeNameEn: (0, import_mysql_core.varchar)("storeNameEn", { length: 255 }).default("Darin Madani Fashion House"),
      storePhone: (0, import_mysql_core.varchar)("storePhone", { length: 32 }),
      storeEmail: (0, import_mysql_core.varchar)("storeEmail", { length: 255 }),
      storeAddress: (0, import_mysql_core.text)("storeAddress"),
      storeAddressEn: (0, import_mysql_core.text)("storeAddressEn"),
      storeLogo: (0, import_mysql_core.text)("storeLogo"),
      taxNumber: (0, import_mysql_core.varchar)("taxNumber", { length: 64 }),
      taxRate: (0, import_mysql_core.decimal)("taxRate", { precision: 5, scale: 2 }).default("15.00"),
      currency: (0, import_mysql_core.varchar)("currency", { length: 8 }).default("SAR"),
      currencySymbol: (0, import_mysql_core.varchar)("currencySymbol", { length: 8 }).default("\u0631.\u0633"),
      invoiceNote: (0, import_mysql_core.text)("invoiceNote"),
      invoiceNoteEn: (0, import_mysql_core.text)("invoiceNoteEn"),
      // WhatsApp (Evolution API)
      whatsappEnabled: (0, import_mysql_core.boolean)("whatsappEnabled").default(false),
      whatsappInstance: (0, import_mysql_core.varchar)("whatsappInstance", { length: 128 }),
      whatsappApiKey: (0, import_mysql_core.varchar)("whatsappApiKey", { length: 255 }),
      whatsappApiBase: (0, import_mysql_core.varchar)("whatsappApiBase", { length: 255 }).default("https://elv.academy-smart.com"),
      whatsappTemplate: (0, import_mysql_core.text)("whatsappTemplate"),
      // MyFatoorah
      myfatoorahEnabled: (0, import_mysql_core.boolean)("myfatoorahEnabled").default(false),
      myfatoorahToken: (0, import_mysql_core.text)("myfatoorahToken"),
      myfatoorahEnv: (0, import_mysql_core.mysqlEnum)("myfatoorahEnv", ["sandbox", "live"]).default("sandbox"),
      myfatoorahSupplier: (0, import_mysql_core.varchar)("myfatoorahSupplier", { length: 64 }),
      priceIncludesTax: (0, import_mysql_core.boolean)("priceIncludesTax").default(false),
      updatedAt: (0, import_mysql_core.timestamp)("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    warehouses = (0, import_mysql_core.mysqlTable)("warehouses", {
      id: (0, import_mysql_core.int)("id").autoincrement().primaryKey(),
      name: (0, import_mysql_core.varchar)("name", { length: 255 }).notNull(),
      nameEn: (0, import_mysql_core.varchar)("nameEn", { length: 255 }),
      description: (0, import_mysql_core.text)("description"),
      isDefault: (0, import_mysql_core.boolean)("isDefault").default(false).notNull(),
      isActive: (0, import_mysql_core.boolean)("isActive").default(true).notNull(),
      createdAt: (0, import_mysql_core.timestamp)("createdAt").defaultNow().notNull(),
      updatedAt: (0, import_mysql_core.timestamp)("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    categories = (0, import_mysql_core.mysqlTable)("categories", {
      id: (0, import_mysql_core.int)("id").autoincrement().primaryKey(),
      name: (0, import_mysql_core.varchar)("name", { length: 255 }).notNull(),
      nameEn: (0, import_mysql_core.varchar)("nameEn", { length: 255 }),
      parentId: (0, import_mysql_core.int)("parentId"),
      sortOrder: (0, import_mysql_core.int)("sortOrder").default(0),
      isActive: (0, import_mysql_core.boolean)("isActive").default(true).notNull(),
      createdAt: (0, import_mysql_core.timestamp)("createdAt").defaultNow().notNull()
    });
    products = (0, import_mysql_core.mysqlTable)("products", {
      id: (0, import_mysql_core.int)("id").autoincrement().primaryKey(),
      sku: (0, import_mysql_core.varchar)("sku", { length: 64 }).unique(),
      barcode: (0, import_mysql_core.varchar)("barcode", { length: 64 }).unique(),
      name: (0, import_mysql_core.varchar)("name", { length: 255 }).notNull(),
      nameEn: (0, import_mysql_core.varchar)("nameEn", { length: 255 }),
      description: (0, import_mysql_core.text)("description"),
      descriptionEn: (0, import_mysql_core.text)("descriptionEn"),
      categoryId: (0, import_mysql_core.int)("categoryId"),
      color: (0, import_mysql_core.varchar)("color", { length: 64 }),
      colorEn: (0, import_mysql_core.varchar)("colorEn", { length: 64 }),
      colorHex: (0, import_mysql_core.varchar)("colorHex", { length: 16 }),
      size: (0, import_mysql_core.varchar)("size", { length: 32 }),
      costPrice: (0, import_mysql_core.decimal)("costPrice", { precision: 10, scale: 2 }).default("0.00"),
      salePrice: (0, import_mysql_core.decimal)("salePrice", { precision: 10, scale: 2 }).notNull(),
      images: (0, import_mysql_core.json)("images").$type().default([]),
      isActive: (0, import_mysql_core.boolean)("isActive").default(true).notNull(),
      lowStockAlert: (0, import_mysql_core.int)("lowStockAlert").default(5),
      createdAt: (0, import_mysql_core.timestamp)("createdAt").defaultNow().notNull(),
      updatedAt: (0, import_mysql_core.timestamp)("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    productStock = (0, import_mysql_core.mysqlTable)("product_stock", {
      id: (0, import_mysql_core.int)("id").autoincrement().primaryKey(),
      productId: (0, import_mysql_core.int)("productId").notNull(),
      warehouseId: (0, import_mysql_core.int)("warehouseId").notNull(),
      qty: (0, import_mysql_core.int)("qty").default(0).notNull(),
      updatedAt: (0, import_mysql_core.timestamp)("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    stockMovements = (0, import_mysql_core.mysqlTable)("stock_movements", {
      id: (0, import_mysql_core.int)("id").autoincrement().primaryKey(),
      productId: (0, import_mysql_core.int)("productId").notNull(),
      warehouseId: (0, import_mysql_core.int)("warehouseId").notNull(),
      toWarehouseId: (0, import_mysql_core.int)("toWarehouseId"),
      type: (0, import_mysql_core.mysqlEnum)("type", ["purchase", "sale", "return", "transfer", "adjustment"]).notNull(),
      qty: (0, import_mysql_core.int)("qty").notNull(),
      costPrice: (0, import_mysql_core.decimal)("costPrice", { precision: 10, scale: 2 }),
      reference: (0, import_mysql_core.varchar)("reference", { length: 128 }),
      notes: (0, import_mysql_core.text)("notes"),
      userId: (0, import_mysql_core.int)("userId"),
      createdAt: (0, import_mysql_core.timestamp)("createdAt").defaultNow().notNull()
    });
    barcodeSerials = (0, import_mysql_core.mysqlTable)("barcode_serials", {
      id: (0, import_mysql_core.int)("id").autoincrement().primaryKey(),
      variantBarcode: (0, import_mysql_core.varchar)("variantBarcode", { length: 128 }).notNull().unique(),
      lastSerial: (0, import_mysql_core.int)("lastSerial").default(0).notNull(),
      updatedAt: (0, import_mysql_core.timestamp)("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    customers = (0, import_mysql_core.mysqlTable)("customers", {
      id: (0, import_mysql_core.int)("id").autoincrement().primaryKey(),
      name: (0, import_mysql_core.varchar)("name", { length: 255 }).notNull(),
      phone: (0, import_mysql_core.varchar)("phone", { length: 32 }).unique(),
      email: (0, import_mysql_core.varchar)("email", { length: 320 }),
      city: (0, import_mysql_core.varchar)("city", { length: 128 }),
      address: (0, import_mysql_core.text)("address"),
      notes: (0, import_mysql_core.text)("notes"),
      points: (0, import_mysql_core.int)("points").default(0),
      totalSpent: (0, import_mysql_core.decimal)("totalSpent", { precision: 12, scale: 2 }).default("0.00"),
      createdAt: (0, import_mysql_core.timestamp)("createdAt").defaultNow().notNull(),
      updatedAt: (0, import_mysql_core.timestamp)("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    discounts = (0, import_mysql_core.mysqlTable)("discounts", {
      id: (0, import_mysql_core.int)("id").autoincrement().primaryKey(),
      name: (0, import_mysql_core.varchar)("name", { length: 255 }).notNull(),
      nameEn: (0, import_mysql_core.varchar)("nameEn", { length: 255 }),
      type: (0, import_mysql_core.mysqlEnum)("type", ["percentage", "fixed"]).notNull(),
      value: (0, import_mysql_core.decimal)("value", { precision: 10, scale: 2 }).notNull(),
      minAmount: (0, import_mysql_core.decimal)("minAmount", { precision: 10, scale: 2 }).default("0.00"),
      maxUses: (0, import_mysql_core.int)("maxUses"),
      usedCount: (0, import_mysql_core.int)("usedCount").default(0),
      isActive: (0, import_mysql_core.boolean)("isActive").default(true).notNull(),
      startDate: (0, import_mysql_core.timestamp)("startDate"),
      endDate: (0, import_mysql_core.timestamp)("endDate"),
      createdAt: (0, import_mysql_core.timestamp)("createdAt").defaultNow().notNull()
    });
    invoices = (0, import_mysql_core.mysqlTable)("invoices", {
      id: (0, import_mysql_core.int)("id").autoincrement().primaryKey(),
      invoiceNumber: (0, import_mysql_core.varchar)("invoiceNumber", { length: 32 }).notNull().unique(),
      customerId: (0, import_mysql_core.int)("customerId"),
      customerName: (0, import_mysql_core.varchar)("customerName", { length: 255 }),
      customerPhone: (0, import_mysql_core.varchar)("customerPhone", { length: 32 }),
      warehouseId: (0, import_mysql_core.int)("warehouseId"),
      subtotal: (0, import_mysql_core.decimal)("subtotal", { precision: 12, scale: 2 }).notNull(),
      discountType: (0, import_mysql_core.mysqlEnum)("discountType", ["percentage", "fixed", "none"]).default("none"),
      discountValue: (0, import_mysql_core.decimal)("discountValue", { precision: 10, scale: 2 }).default("0.00"),
      discountAmount: (0, import_mysql_core.decimal)("discountAmount", { precision: 10, scale: 2 }).default("0.00"),
      discountId: (0, import_mysql_core.int)("discountId"),
      taxRate: (0, import_mysql_core.decimal)("taxRate", { precision: 5, scale: 2 }).default("0.00"),
      taxAmount: (0, import_mysql_core.decimal)("taxAmount", { precision: 10, scale: 2 }).default("0.00"),
      total: (0, import_mysql_core.decimal)("total", { precision: 12, scale: 2 }).notNull(),
      paymentMethod: (0, import_mysql_core.mysqlEnum)("paymentMethod", ["cash", "card", "transfer", "electronic", "mixed"]).default("cash"),
      paymentStatus: (0, import_mysql_core.mysqlEnum)("paymentStatus", ["paid", "pending", "partial", "refunded"]).default("paid"),
      status: (0, import_mysql_core.mysqlEnum)("status", ["completed", "cancelled", "returned"]).default("completed"),
      notes: (0, import_mysql_core.text)("notes"),
      token: (0, import_mysql_core.varchar)("token", { length: 64 }).unique(),
      // MyFatoorah
      mfInvoiceId: (0, import_mysql_core.varchar)("mfInvoiceId", { length: 128 }),
      mfPaymentUrl: (0, import_mysql_core.text)("mfPaymentUrl"),
      mfQrCode: (0, import_mysql_core.text)("mfQrCode"),
      mfStatus: (0, import_mysql_core.varchar)("mfStatus", { length: 32 }),
      // WhatsApp
      whatsappSent: (0, import_mysql_core.boolean)("whatsappSent").default(false),
      whatsappSentAt: (0, import_mysql_core.timestamp)("whatsappSentAt"),
      cashierId: (0, import_mysql_core.int)("cashierId"),
      createdAt: (0, import_mysql_core.timestamp)("createdAt").defaultNow().notNull(),
      updatedAt: (0, import_mysql_core.timestamp)("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    invoiceItems = (0, import_mysql_core.mysqlTable)("invoice_items", {
      id: (0, import_mysql_core.int)("id").autoincrement().primaryKey(),
      invoiceId: (0, import_mysql_core.int)("invoiceId").notNull(),
      productId: (0, import_mysql_core.int)("productId"),
      productName: (0, import_mysql_core.varchar)("productName", { length: 255 }).notNull(),
      productNameEn: (0, import_mysql_core.varchar)("productNameEn", { length: 255 }),
      barcode: (0, import_mysql_core.varchar)("barcode", { length: 64 }),
      color: (0, import_mysql_core.varchar)("color", { length: 64 }),
      size: (0, import_mysql_core.varchar)("size", { length: 32 }),
      qty: (0, import_mysql_core.int)("qty").notNull(),
      unitPrice: (0, import_mysql_core.decimal)("unitPrice", { precision: 10, scale: 2 }).notNull(),
      discountPct: (0, import_mysql_core.decimal)("discountPct", { precision: 5, scale: 2 }).default("0.00"),
      lineTotal: (0, import_mysql_core.decimal)("lineTotal", { precision: 12, scale: 2 }).notNull()
    });
    returns = (0, import_mysql_core.mysqlTable)("returns", {
      id: (0, import_mysql_core.int)("id").autoincrement().primaryKey(),
      returnNumber: (0, import_mysql_core.varchar)("returnNumber", { length: 32 }).notNull().unique(),
      invoiceId: (0, import_mysql_core.int)("invoiceId").notNull(),
      invoiceNumber: (0, import_mysql_core.varchar)("invoiceNumber", { length: 32 }),
      customerId: (0, import_mysql_core.int)("customerId"),
      customerName: (0, import_mysql_core.varchar)("customerName", { length: 255 }),
      warehouseId: (0, import_mysql_core.int)("warehouseId"),
      refundAmount: (0, import_mysql_core.decimal)("refundAmount", { precision: 12, scale: 2 }).notNull(),
      refundMethod: (0, import_mysql_core.mysqlEnum)("refundMethod", ["cash", "card", "transfer", "credit"]).default("cash"),
      reason: (0, import_mysql_core.text)("reason"),
      status: (0, import_mysql_core.mysqlEnum)("status", ["completed", "pending"]).default("completed"),
      processedBy: (0, import_mysql_core.int)("processedBy"),
      createdAt: (0, import_mysql_core.timestamp)("createdAt").defaultNow().notNull()
    });
    returnItems = (0, import_mysql_core.mysqlTable)("return_items", {
      id: (0, import_mysql_core.int)("id").autoincrement().primaryKey(),
      returnId: (0, import_mysql_core.int)("returnId").notNull(),
      productId: (0, import_mysql_core.int)("productId"),
      productName: (0, import_mysql_core.varchar)("productName", { length: 255 }).notNull(),
      barcode: (0, import_mysql_core.varchar)("barcode", { length: 64 }),
      color: (0, import_mysql_core.varchar)("color", { length: 64 }),
      size: (0, import_mysql_core.varchar)("size", { length: 32 }),
      qty: (0, import_mysql_core.int)("qty").notNull(),
      unitPrice: (0, import_mysql_core.decimal)("unitPrice", { precision: 10, scale: 2 }).notNull(),
      lineTotal: (0, import_mysql_core.decimal)("lineTotal", { precision: 12, scale: 2 }).notNull()
    });
    invoicePayments = (0, import_mysql_core.mysqlTable)("invoice_payments", {
      id: (0, import_mysql_core.int)("id").autoincrement().primaryKey(),
      invoiceId: (0, import_mysql_core.int)("invoiceId").notNull(),
      method: (0, import_mysql_core.mysqlEnum)("method", ["cash", "card", "transfer", "electronic"]).notNull().default("cash"),
      amount: (0, import_mysql_core.decimal)("amount", { precision: 12, scale: 2 }).notNull(),
      reference: (0, import_mysql_core.varchar)("reference", { length: 128 }),
      createdAt: (0, import_mysql_core.timestamp)("createdAt").defaultNow().notNull()
    });
    paymentRequests = (0, import_mysql_core.mysqlTable)("payment_requests", {
      id: (0, import_mysql_core.int)("id").autoincrement().primaryKey(),
      token: (0, import_mysql_core.varchar)("token", { length: 64 }).notNull().unique(),
      // Cart snapshot (JSON)
      cartJson: (0, import_mysql_core.text)("cartJson").notNull(),
      customerId: (0, import_mysql_core.int)("customerId"),
      customerName: (0, import_mysql_core.varchar)("customerName", { length: 255 }),
      customerPhone: (0, import_mysql_core.varchar)("customerPhone", { length: 32 }),
      warehouseId: (0, import_mysql_core.int)("warehouseId"),
      cashierId: (0, import_mysql_core.int)("cashierId"),
      subtotal: (0, import_mysql_core.decimal)("subtotal", { precision: 12, scale: 2 }).notNull(),
      discountAmount: (0, import_mysql_core.decimal)("discountAmount", { precision: 10, scale: 2 }).default("0.00"),
      taxRate: (0, import_mysql_core.decimal)("taxRate", { precision: 5, scale: 2 }).default("0.00"),
      taxAmount: (0, import_mysql_core.decimal)("taxAmount", { precision: 10, scale: 2 }).default("0.00"),
      total: (0, import_mysql_core.decimal)("total", { precision: 12, scale: 2 }).notNull(),
      discountType: (0, import_mysql_core.varchar)("discountType", { length: 32 }),
      discountValue: (0, import_mysql_core.decimal)("discountValue", { precision: 10, scale: 2 }).default("0.00"),
      discountId: (0, import_mysql_core.int)("discountId"),
      notes: (0, import_mysql_core.text)("notes"),
      // MyFatoorah
      mfInvoiceId: (0, import_mysql_core.varchar)("mfInvoiceId", { length: 128 }),
      mfPaymentUrl: (0, import_mysql_core.text)("mfPaymentUrl"),
      mfQrCode: (0, import_mysql_core.text)("mfQrCode"),
      mfStatus: (0, import_mysql_core.varchar)("mfStatus", { length: 32 }).default("pending"),
      // After payment
      invoiceId: (0, import_mysql_core.int)("invoiceId"),
      // set after invoice is created
      status: (0, import_mysql_core.mysqlEnum)("status", ["pending", "paid", "failed", "expired"]).default("pending"),
      createdAt: (0, import_mysql_core.timestamp)("createdAt").defaultNow().notNull(),
      updatedAt: (0, import_mysql_core.timestamp)("updatedAt").defaultNow().onUpdateNow().notNull()
    });
  }
});

// server/db.ts
var db_exports = {};
__export(db_exports, {
  addStockMovement: () => addStockMovement,
  createCategory: () => createCategory,
  createCustomer: () => createCustomer,
  createDiscount: () => createDiscount,
  createInvoice: () => createInvoice,
  createInvoiceFromPaymentRequest: () => createInvoiceFromPaymentRequest,
  createProduct: () => createProduct,
  createReturn: () => createReturn,
  createWarehouse: () => createWarehouse,
  deleteCategory: () => deleteCategory,
  deleteCustomer: () => deleteCustomer,
  deleteDiscount: () => deleteDiscount,
  deleteProduct: () => deleteProduct,
  deleteUser: () => deleteUser,
  deleteWarehouse: () => deleteWarehouse,
  generateInvoiceNumber: () => generateInvoiceNumber,
  generateReturnNumber: () => generateReturnNumber,
  getAllUsers: () => getAllUsers,
  getCategories: () => getCategories,
  getCustomerById: () => getCustomerById,
  getCustomers: () => getCustomers,
  getDashboardStats: () => getDashboardStats,
  getDb: () => getDb,
  getDiscounts: () => getDiscounts,
  getInvoiceById: () => getInvoiceById,
  getInvoiceByToken: () => getInvoiceByToken,
  getInvoices: () => getInvoices,
  getLastBarcodeSerial: () => getLastBarcodeSerial,
  getLowStockProducts: () => getLowStockProducts,
  getMonthlySales: () => getMonthlySales,
  getProductByBarcode: () => getProductByBarcode,
  getProductById: () => getProductById,
  getProductStock: () => getProductStock,
  getProductVariants: () => getProductVariants,
  getProducts: () => getProducts,
  getReturnById: () => getReturnById,
  getReturns: () => getReturns,
  getSettings: () => getSettings,
  getStockMovements: () => getStockMovements,
  getTopProducts: () => getTopProducts,
  getUserById: () => getUserById,
  getUserByOpenId: () => getUserByOpenId,
  getUserByUsername: () => getUserByUsername,
  getUserPermissions: () => getUserPermissions,
  getWarehouseById: () => getWarehouseById,
  getWarehouses: () => getWarehouses,
  reserveBarcodeSerials: () => reserveBarcodeSerials,
  setProductStock: () => setProductStock,
  setUserPermissions: () => setUserPermissions,
  updateCategory: () => updateCategory,
  updateCustomer: () => updateCustomer,
  updateDiscount: () => updateDiscount,
  updateInvoice: () => updateInvoice,
  updateProduct: () => updateProduct,
  updateSettings: () => updateSettings,
  updateUser: () => updateUser,
  updateWarehouse: () => updateWarehouse,
  upsertProductStock: () => upsertProductStock,
  upsertUser: () => upsertUser
});
async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = (0, import_mysql2.drizzle)(process.env.DATABASE_URL);
    } catch (e) {
      console.warn("[DB] connect failed:", e);
      _db = null;
    }
  }
  return _db;
}
async function upsertUser(user) {
  if (!user.openId) throw new Error("openId required");
  const db = await getDb();
  if (!db) return;
  const values = { openId: user.openId };
  const updateSet = {};
  ["name", "email", "loginMethod", "phone", "username", "nameEn", "passwordHash"].forEach((f) => {
    if (user[f] !== void 0) {
      values[f] = user[f];
      updateSet[f] = user[f];
    }
  });
  if (user.lastSignedIn !== void 0) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== void 0) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  if (!values.lastSignedIn) {
    values.lastSignedIn = /* @__PURE__ */ new Date();
  }
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = /* @__PURE__ */ new Date();
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}
async function getUserByOpenId(openId) {
  const db = await getDb();
  if (!db) return void 0;
  const r = await db.select().from(users).where((0, import_drizzle_orm.eq)(users.openId, openId)).limit(1);
  return r[0];
}
async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).orderBy((0, import_drizzle_orm.desc)(users.createdAt));
}
async function getUserById(id) {
  const db = await getDb();
  if (!db) return void 0;
  const r = await db.select().from(users).where((0, import_drizzle_orm.eq)(users.id, id)).limit(1);
  return r[0];
}
async function getUserByUsername(username) {
  const db = await getDb();
  if (!db) return void 0;
  const r = await db.select().from(users).where((0, import_drizzle_orm.eq)(users.username, username)).limit(1);
  return r[0];
}
async function updateUser(id, data) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set(data).where((0, import_drizzle_orm.eq)(users.id, id));
}
async function deleteUser(id) {
  const db = await getDb();
  if (!db) return;
  await db.delete(users).where((0, import_drizzle_orm.eq)(users.id, id));
}
async function getUserPermissions(userId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(userPermissions).where((0, import_drizzle_orm.eq)(userPermissions.userId, userId));
}
async function setUserPermissions(userId, perms) {
  const db = await getDb();
  if (!db) return;
  await db.delete(userPermissions).where((0, import_drizzle_orm.eq)(userPermissions.userId, userId));
  if (perms.length > 0) {
    await db.insert(userPermissions).values(perms.map((p) => ({ userId, ...p })));
  }
}
async function getSettings() {
  const db = await getDb();
  if (!db) return null;
  const r = await db.select().from(settings).limit(1);
  return r[0] ?? null;
}
async function updateSettings(data) {
  const db = await getDb();
  if (!db) return;
  const existing = await getSettings();
  if (existing) {
    await db.update(settings).set(data).where((0, import_drizzle_orm.eq)(settings.id, existing.id));
  } else {
    await db.insert(settings).values({ ...data });
  }
}
async function getWarehouses(activeOnly = true) {
  const db = await getDb();
  if (!db) return [];
  if (activeOnly) return db.select().from(warehouses).where((0, import_drizzle_orm.eq)(warehouses.isActive, true));
  return db.select().from(warehouses);
}
async function getWarehouseById(id) {
  const db = await getDb();
  if (!db) return void 0;
  const r = await db.select().from(warehouses).where((0, import_drizzle_orm.eq)(warehouses.id, id)).limit(1);
  return r[0];
}
async function createWarehouse(data) {
  const db = await getDb();
  if (!db) return;
  await db.insert(warehouses).values(data);
}
async function updateWarehouse(id, data) {
  const db = await getDb();
  if (!db) return;
  await db.update(warehouses).set(data).where((0, import_drizzle_orm.eq)(warehouses.id, id));
}
async function deleteWarehouse(id) {
  const db = await getDb();
  if (!db) return;
  await db.delete(warehouses).where((0, import_drizzle_orm.eq)(warehouses.id, id));
}
async function getCategories() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(categories).where((0, import_drizzle_orm.eq)(categories.isActive, true)).orderBy(categories.sortOrder);
}
async function createCategory(data) {
  const db = await getDb();
  if (!db) return;
  await db.insert(categories).values(data);
}
async function updateCategory(id, data) {
  const db = await getDb();
  if (!db) return;
  await db.update(categories).set(data).where((0, import_drizzle_orm.eq)(categories.id, id));
}
async function deleteCategory(id) {
  const db = await getDb();
  if (!db) return;
  await db.delete(categories).where((0, import_drizzle_orm.eq)(categories.id, id));
}
async function getProducts(filters) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [(0, import_drizzle_orm.eq)(products.isActive, true)];
  if (filters?.search) {
    const s = `%${filters.search}%`;
    conditions.push((0, import_drizzle_orm.or)((0, import_drizzle_orm.like)(products.name, s), (0, import_drizzle_orm.like)(products.nameEn, s), (0, import_drizzle_orm.like)(products.barcode, s), (0, import_drizzle_orm.like)(products.sku, s)));
  }
  if (filters?.categoryId) conditions.push((0, import_drizzle_orm.eq)(products.categoryId, filters.categoryId));
  const rows = await db.select().from(products).where((0, import_drizzle_orm.and)(...conditions)).orderBy((0, import_drizzle_orm.desc)(products.createdAt));
  const stockRows = await db.select().from(productStock);
  return rows.map((p) => {
    const stock = stockRows.filter((s) => s.productId === p.id);
    const totalQty = stock.reduce((a, b) => a + b.qty, 0);
    return { ...p, stock, totalQty };
  });
}
async function getProductById(id) {
  const db = await getDb();
  if (!db) return void 0;
  const r = await db.select().from(products).where((0, import_drizzle_orm.eq)(products.id, id)).limit(1);
  if (!r[0]) return void 0;
  const stock = await db.select().from(productStock).where((0, import_drizzle_orm.eq)(productStock.productId, id));
  return { ...r[0], stock, totalQty: stock.reduce((a, b) => a + b.qty, 0) };
}
async function getProductByBarcode(barcode) {
  const db = await getDb();
  if (!db) return void 0;
  const r = await db.select().from(products).where((0, import_drizzle_orm.eq)(products.barcode, barcode)).limit(1);
  if (!r[0]) return void 0;
  const stock = await db.select().from(productStock).where((0, import_drizzle_orm.eq)(productStock.productId, r[0].id));
  return { ...r[0], stock, totalQty: stock.reduce((a, b) => a + b.qty, 0) };
}
async function createProduct(data) {
  const db = await getDb();
  if (!db) return null;
  const [result] = await db.insert(products).values(data);
  return result.insertId;
}
async function updateProduct(id, data) {
  const db = await getDb();
  if (!db) return;
  await db.update(products).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm.eq)(products.id, id));
}
async function deleteProduct(id) {
  const db = await getDb();
  if (!db) return;
  await db.update(products).set({ isActive: false }).where((0, import_drizzle_orm.eq)(products.id, id));
}
async function getProductStock(productId, warehouseId) {
  const db = await getDb();
  if (!db) return [];
  const conds = [(0, import_drizzle_orm.eq)(productStock.productId, productId)];
  if (warehouseId) conds.push((0, import_drizzle_orm.eq)(productStock.warehouseId, warehouseId));
  return db.select().from(productStock).where((0, import_drizzle_orm.and)(...conds));
}
async function upsertProductStock(productId, warehouseId, qty) {
  const db = await getDb();
  if (!db) return;
  await db.insert(productStock).values({ productId, warehouseId, qty }).onDuplicateKeyUpdate({ set: { qty: import_drizzle_orm.sql`qty + ${qty}` } });
}
async function setProductStock(productId, warehouseId, qty) {
  const db = await getDb();
  if (!db) return;
  const existing = await db.select().from(productStock).where((0, import_drizzle_orm.and)((0, import_drizzle_orm.eq)(productStock.productId, productId), (0, import_drizzle_orm.eq)(productStock.warehouseId, warehouseId))).limit(1);
  if (existing[0]) {
    await db.update(productStock).set({ qty }).where((0, import_drizzle_orm.eq)(productStock.id, existing[0].id));
  } else {
    await db.insert(productStock).values({ productId, warehouseId, qty });
  }
}
async function addStockMovement(data) {
  const db = await getDb();
  if (!db) return;
  await db.insert(stockMovements).values(data);
}
async function getStockMovements(productId, warehouseId) {
  const db = await getDb();
  if (!db) return [];
  const conds = [];
  if (productId) conds.push((0, import_drizzle_orm.eq)(stockMovements.productId, productId));
  if (warehouseId) conds.push((0, import_drizzle_orm.eq)(stockMovements.warehouseId, warehouseId));
  return db.select().from(stockMovements).where(conds.length ? (0, import_drizzle_orm.and)(...conds) : void 0).orderBy((0, import_drizzle_orm.desc)(stockMovements.createdAt)).limit(100);
}
async function reserveBarcodeSerials(variantBarcode, qty) {
  const db = await getDb();
  if (!db) return [];
  await db.insert(barcodeSerials).values({ variantBarcode, lastSerial: qty }).onDuplicateKeyUpdate({ set: { lastSerial: import_drizzle_orm.sql`lastSerial + ${qty}` } });
  const row = await db.select().from(barcodeSerials).where((0, import_drizzle_orm.eq)(barcodeSerials.variantBarcode, variantBarcode)).limit(1);
  const lastSerial = row[0]?.lastSerial ?? qty;
  const start = lastSerial - qty + 1;
  return Array.from({ length: qty }, (_, i) => start + i);
}
async function getLastBarcodeSerial(variantBarcode) {
  const db = await getDb();
  if (!db) return 0;
  const row = await db.select().from(barcodeSerials).where((0, import_drizzle_orm.eq)(barcodeSerials.variantBarcode, variantBarcode)).limit(1);
  return row[0]?.lastSerial ?? 0;
}
async function getProductVariants(productId) {
  const db = await getDb();
  if (!db) return [];
  const base = await db.select().from(products).where((0, import_drizzle_orm.eq)(products.id, productId)).limit(1);
  if (!base[0]) return [];
  const baseName = base[0].name;
  const variants = await db.select().from(products).where((0, import_drizzle_orm.and)((0, import_drizzle_orm.eq)(products.name, baseName), (0, import_drizzle_orm.eq)(products.isActive, true))).orderBy(products.color, products.size);
  const variantIds = variants.map((v) => v.id);
  if (!variantIds.length) return [];
  const stockRows = await db.select().from(productStock).where(import_drizzle_orm.sql`${productStock.productId} IN (${import_drizzle_orm.sql.join(variantIds.map((id) => import_drizzle_orm.sql`${id}`), import_drizzle_orm.sql`, `)})`);
  const warehouseRows = await db.select().from(warehouses).where((0, import_drizzle_orm.eq)(warehouses.isActive, true));
  return variants.map((v) => ({
    ...v,
    stock: stockRows.filter((s) => s.productId === v.id),
    totalQty: stockRows.filter((s) => s.productId === v.id).reduce((a, b) => a + b.qty, 0),
    warehouses: warehouseRows
  }));
}
async function getCustomers(search) {
  const db = await getDb();
  if (!db) return [];
  if (search) {
    const s = `%${search}%`;
    return db.select().from(customers).where((0, import_drizzle_orm.or)((0, import_drizzle_orm.like)(customers.name, s), (0, import_drizzle_orm.like)(customers.phone, s), (0, import_drizzle_orm.like)(customers.email, s))).orderBy((0, import_drizzle_orm.desc)(customers.createdAt));
  }
  return db.select().from(customers).orderBy((0, import_drizzle_orm.desc)(customers.createdAt));
}
async function getCustomerById(id) {
  const db = await getDb();
  if (!db) return void 0;
  const r = await db.select().from(customers).where((0, import_drizzle_orm.eq)(customers.id, id)).limit(1);
  return r[0];
}
async function createCustomer(data) {
  const db = await getDb();
  if (!db) return null;
  const [result] = await db.insert(customers).values(data);
  return result.insertId;
}
async function updateCustomer(id, data) {
  const db = await getDb();
  if (!db) return;
  await db.update(customers).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm.eq)(customers.id, id));
}
async function deleteCustomer(id) {
  const db = await getDb();
  if (!db) return;
  await db.delete(customers).where((0, import_drizzle_orm.eq)(customers.id, id));
}
async function getDiscounts(activeOnly = false) {
  const db = await getDb();
  if (!db) return [];
  if (activeOnly) return db.select().from(discounts).where((0, import_drizzle_orm.eq)(discounts.isActive, true));
  return db.select().from(discounts).orderBy((0, import_drizzle_orm.desc)(discounts.createdAt));
}
async function createDiscount(data) {
  const db = await getDb();
  if (!db) return null;
  const [result] = await db.insert(discounts).values(data);
  return result.insertId;
}
async function updateDiscount(id, data) {
  const db = await getDb();
  if (!db) return;
  await db.update(discounts).set(data).where((0, import_drizzle_orm.eq)(discounts.id, id));
}
async function deleteDiscount(id) {
  const db = await getDb();
  if (!db) return;
  await db.delete(discounts).where((0, import_drizzle_orm.eq)(discounts.id, id));
}
async function getInvoices(filters) {
  const db = await getDb();
  if (!db) return [];
  const conds = [];
  if (filters?.search) {
    const s = `%${filters.search}%`;
    conds.push((0, import_drizzle_orm.or)((0, import_drizzle_orm.like)(invoices.invoiceNumber, s), (0, import_drizzle_orm.like)(invoices.customerName, s), (0, import_drizzle_orm.like)(invoices.customerPhone, s)));
  }
  if (filters?.status) conds.push((0, import_drizzle_orm.eq)(invoices.status, filters.status));
  if (filters?.from) conds.push((0, import_drizzle_orm.gte)(invoices.createdAt, filters.from));
  if (filters?.to) conds.push((0, import_drizzle_orm.lte)(invoices.createdAt, filters.to));
  if (filters?.customerId) conds.push((0, import_drizzle_orm.eq)(invoices.customerId, filters.customerId));
  const rows = await db.select().from(invoices).where(conds.length ? (0, import_drizzle_orm.and)(...conds) : void 0).orderBy((0, import_drizzle_orm.desc)(invoices.createdAt));
  return rows;
}
async function getInvoiceById(id) {
  const db = await getDb();
  if (!db) return void 0;
  const r = await db.select().from(invoices).where((0, import_drizzle_orm.eq)(invoices.id, id)).limit(1);
  if (!r[0]) return void 0;
  const items = await db.select().from(invoiceItems).where((0, import_drizzle_orm.eq)(invoiceItems.invoiceId, id));
  const settingsRows = await db.select().from(settings).limit(1);
  return { ...r[0], items, settings: settingsRows[0] || null };
}
async function getInvoiceByToken(token) {
  const db = await getDb();
  if (!db) return void 0;
  const r = await db.select().from(invoices).where((0, import_drizzle_orm.eq)(invoices.token, token)).limit(1);
  if (!r[0]) return void 0;
  const items = await db.select().from(invoiceItems).where((0, import_drizzle_orm.eq)(invoiceItems.invoiceId, r[0].id));
  const settingsRows = await db.select().from(settings).limit(1);
  return { ...r[0], items, settings: settingsRows[0] || null };
}
async function createInvoice(data, items) {
  const db = await getDb();
  if (!db) return null;
  const [result] = await db.insert(invoices).values(data);
  const id = result.insertId;
  if (items.length > 0) {
    await db.insert(invoiceItems).values(items.map((i) => ({ ...i, invoiceId: id })));
  }
  return id;
}
async function updateInvoice(id, data) {
  const db = await getDb();
  if (!db) return;
  await db.update(invoices).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm.eq)(invoices.id, id));
}
async function generateInvoiceNumber() {
  const db = await getDb();
  if (!db) return `INV-${Date.now()}`;
  const today = /* @__PURE__ */ new Date();
  const prefix = `INV-${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}`;
  const r = await db.select({ num: invoices.invoiceNumber }).from(invoices).where((0, import_drizzle_orm.like)(invoices.invoiceNumber, `${prefix}%`)).orderBy((0, import_drizzle_orm.desc)(invoices.invoiceNumber)).limit(1);
  const last = r[0]?.num;
  const seq = last ? parseInt(last.split("-").pop() || "0") + 1 : 1;
  return `${prefix}-${String(seq).padStart(4, "0")}`;
}
async function getReturns(search) {
  const db = await getDb();
  if (!db) return [];
  if (search) {
    const s = `%${search}%`;
    return db.select().from(returns).where((0, import_drizzle_orm.or)((0, import_drizzle_orm.like)(returns.returnNumber, s), (0, import_drizzle_orm.like)(returns.invoiceNumber, s), (0, import_drizzle_orm.like)(returns.customerName, s))).orderBy((0, import_drizzle_orm.desc)(returns.createdAt));
  }
  return db.select().from(returns).orderBy((0, import_drizzle_orm.desc)(returns.createdAt));
}
async function getReturnById(id) {
  const db = await getDb();
  if (!db) return void 0;
  const r = await db.select().from(returns).where((0, import_drizzle_orm.eq)(returns.id, id)).limit(1);
  if (!r[0]) return void 0;
  const items = await db.select().from(returnItems).where((0, import_drizzle_orm.eq)(returnItems.returnId, id));
  return { ...r[0], items };
}
async function createReturn(data, items) {
  const db = await getDb();
  if (!db) return null;
  const [result] = await db.insert(returns).values(data);
  const id = result.insertId;
  if (items.length > 0) {
    await db.insert(returnItems).values(items.map((i) => ({ ...i, returnId: id })));
  }
  return id;
}
async function generateReturnNumber() {
  const db = await getDb();
  if (!db) return `RET-${Date.now()}`;
  const today = /* @__PURE__ */ new Date();
  const prefix = `RET-${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}`;
  const r = await db.select({ num: returns.returnNumber }).from(returns).where((0, import_drizzle_orm.like)(returns.returnNumber, `${prefix}%`)).orderBy((0, import_drizzle_orm.desc)(returns.returnNumber)).limit(1);
  const last = r[0]?.num;
  const seq = last ? parseInt(last.split("-").pop() || "0") + 1 : 1;
  return `${prefix}-${String(seq).padStart(4, "0")}`;
}
async function getDashboardStats() {
  const db = await getDb();
  if (!db) return { todaySales: 0, todayOrders: 0, monthSales: 0, monthOrders: 0, totalCustomers: 0, lowStockCount: 0 };
  const now = /* @__PURE__ */ new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const todayRows = await db.execute(import_drizzle_orm.sql`SELECT COUNT(*) as cnt, COALESCE(SUM(total),0) as total FROM invoices WHERE status='completed' AND createdAt >= ${todayStart}`);
  const monthRows = await db.execute(import_drizzle_orm.sql`SELECT COUNT(*) as cnt, COALESCE(SUM(total),0) as total FROM invoices WHERE status='completed' AND createdAt >= ${monthStart}`);
  const custRows = await db.execute(import_drizzle_orm.sql`SELECT COUNT(*) as cnt FROM customers`);
  const lowRows = await db.execute(import_drizzle_orm.sql`SELECT COUNT(*) as cnt FROM products p WHERE p.isActive=1 AND (SELECT COALESCE(SUM(qty),0) FROM product_stock WHERE productId=p.id) <= p.lowStockAlert`);
  const today = todayRows[0]?.[0];
  const month = monthRows[0]?.[0];
  const cust = custRows[0]?.[0];
  const low = lowRows[0]?.[0];
  return {
    todaySales: parseFloat(today?.total || "0"),
    todayOrders: parseInt(today?.cnt || "0"),
    monthSales: parseFloat(month?.total || "0"),
    monthOrders: parseInt(month?.cnt || "0"),
    totalCustomers: parseInt(cust?.cnt || "0"),
    lowStockCount: parseInt(low?.cnt || "0")
  };
}
async function getTopProducts(limit = 10) {
  const db = await getDb();
  if (!db) return [];
  const result = await db.execute(import_drizzle_orm.sql`
    SELECT ii.productId, ii.productName, SUM(ii.qty) as totalQty, SUM(ii.lineTotal) as totalRevenue
    FROM invoice_items ii
    JOIN invoices i ON i.id = ii.invoiceId
    WHERE i.status = 'completed'
    GROUP BY ii.productId, ii.productName
    ORDER BY totalRevenue DESC
    LIMIT ${limit}
  `);
  return result[0] || [];
}
async function getMonthlySales(months = 12) {
  const db = await getDb();
  if (!db) return [];
  const result = await db.execute(import_drizzle_orm.sql`
    SELECT DATE_FORMAT(createdAt, '%Y-%m') as month, COUNT(*) as orders, COALESCE(SUM(total),0) as total
    FROM invoices WHERE status='completed'
    GROUP BY month ORDER BY month DESC LIMIT ${months}
  `);
  return (result[0] || []).reverse();
}
async function getLowStockProducts() {
  const db = await getDb();
  if (!db) return [];
  const result = await db.execute(import_drizzle_orm.sql`
    SELECT p.*, COALESCE(SUM(ps.qty),0) as totalQty
    FROM products p
    LEFT JOIN product_stock ps ON ps.productId = p.id
    WHERE p.isActive = 1
    GROUP BY p.id
    HAVING totalQty <= p.lowStockAlert
    ORDER BY totalQty ASC
  `);
  return result[0] || [];
}
async function createInvoiceFromPaymentRequest(pr, settings2) {
  const db = await getDb();
  if (!db) throw new Error("DB connection failed");
  const count = await db.select({ id: invoices.id }).from(invoices);
  const invoiceNumber = `INV-${String(count.length + 1).padStart(6, "0")}`;
  const token = require("crypto").randomBytes(16).toString("hex");
  const cartItems = JSON.parse(pr.cartJson || "[]");
  const [result] = await db.insert(invoices).values({
    invoiceNumber,
    token,
    customerId: pr.customerId,
    customerName: pr.customerName,
    customerPhone: pr.customerPhone,
    warehouseId: pr.warehouseId,
    cashierId: pr.cashierId,
    subtotal: pr.subtotal,
    discountType: pr.discountType || "none",
    discountValue: pr.discountValue || "0.00",
    discountAmount: pr.discountAmount || "0.00",
    discountId: pr.discountId,
    taxRate: pr.taxRate || "0.00",
    taxAmount: pr.taxAmount || "0.00",
    total: pr.total,
    paymentMethod: "electronic",
    paymentStatus: "paid",
    status: "completed",
    notes: pr.notes,
    mfInvoiceId: pr.mfInvoiceId,
    mfPaymentUrl: pr.mfPaymentUrl,
    mfQrCode: pr.mfQrCode,
    mfStatus: "CAPTURED",
    whatsappSent: false
  });
  const invoiceId = result.insertId;
  for (const item of cartItems) {
    await db.insert(invoiceItems).values({
      invoiceId,
      productId: item.productId,
      productName: item.productName,
      productNameEn: item.productNameEn,
      barcode: item.barcode,
      color: item.color,
      size: item.size,
      qty: item.qty,
      unitPrice: String(item.unitPrice),
      discountPct: String(item.discountPct || 0),
      lineTotal: String(item.lineTotal)
    });
    if (item.productId) {
      await addStockMovement({
        productId: item.productId,
        type: "sale",
        qty: -item.qty,
        reference: invoiceNumber,
        warehouseId: pr.warehouseId,
        notes: `\u0641\u0627\u062A\u0648\u0631\u0629 ${invoiceNumber}`
      });
    }
  }
  if (pr.customerId) {
    await updateCustomer(pr.customerId, {
      lastPurchaseAt: /* @__PURE__ */ new Date()
    });
  }
  return invoiceId;
}
var import_drizzle_orm, import_mysql2, _db;
var init_db = __esm({
  "server/db.ts"() {
    "use strict";
    import_drizzle_orm = require("drizzle-orm");
    import_mysql2 = require("drizzle-orm/mysql2");
    init_schema();
    init_env();
    _db = null;
  }
});

// server/_core/index.prod.ts
var import_dotenv = __toESM(require("dotenv"), 1);
var import_path = __toESM(require("path"), 1);
var import_express = __toESM(require("express"), 1);
var import_http = require("http");
var import_multer = __toESM(require("multer"), 1);
var import_express2 = require("@trpc/server/adapters/express");

// server/_core/storageProxy.ts
init_env();
function registerStorageProxy(app) {
  app.get("/manus-storage/*", async (req, res) => {
    const key = req.params[0];
    if (!key) {
      res.status(400).send("Missing storage key");
      return;
    }
    if (!ENV.forgeApiUrl || !ENV.forgeApiKey) {
      res.status(500).send("Storage proxy not configured");
      return;
    }
    try {
      const forgeUrl = new URL(
        "v1/storage/presign/get",
        ENV.forgeApiUrl.replace(/\/+$/, "") + "/"
      );
      forgeUrl.searchParams.set("path", key);
      const forgeResp = await fetch(forgeUrl, {
        headers: { Authorization: `Bearer ${ENV.forgeApiKey}` }
      });
      if (!forgeResp.ok) {
        const body = await forgeResp.text().catch(() => "");
        console.error(`[StorageProxy] forge error: ${forgeResp.status} ${body}`);
        res.status(502).send("Storage backend error");
        return;
      }
      const { url } = await forgeResp.json();
      if (!url) {
        res.status(502).send("Empty signed URL from backend");
        return;
      }
      res.set("Cache-Control", "no-store");
      res.redirect(307, url);
    } catch (err) {
      console.error("[StorageProxy] failed:", err);
      res.status(502).send("Storage proxy error");
    }
  });
}

// server/_core/systemRouter.ts
var import_zod = require("zod");

// server/_core/notification.ts
var import_server = require("@trpc/server");
init_env();
var TITLE_MAX_LENGTH = 1200;
var CONTENT_MAX_LENGTH = 2e4;
var trimValue = (value) => value.trim();
var isNonEmptyString = (value) => typeof value === "string" && value.trim().length > 0;
var buildEndpointUrl = (baseUrl) => {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return new URL(
    "webdevtoken.v1.WebDevService/SendNotification",
    normalizedBase
  ).toString();
};
var validatePayload = (input) => {
  if (!isNonEmptyString(input.title)) {
    throw new import_server.TRPCError({
      code: "BAD_REQUEST",
      message: "Notification title is required."
    });
  }
  if (!isNonEmptyString(input.content)) {
    throw new import_server.TRPCError({
      code: "BAD_REQUEST",
      message: "Notification content is required."
    });
  }
  const title = trimValue(input.title);
  const content = trimValue(input.content);
  if (title.length > TITLE_MAX_LENGTH) {
    throw new import_server.TRPCError({
      code: "BAD_REQUEST",
      message: `Notification title must be at most ${TITLE_MAX_LENGTH} characters.`
    });
  }
  if (content.length > CONTENT_MAX_LENGTH) {
    throw new import_server.TRPCError({
      code: "BAD_REQUEST",
      message: `Notification content must be at most ${CONTENT_MAX_LENGTH} characters.`
    });
  }
  return { title, content };
};
async function notifyOwner(payload) {
  const { title, content } = validatePayload(payload);
  if (!ENV.forgeApiUrl) {
    throw new import_server.TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service URL is not configured."
    });
  }
  if (!ENV.forgeApiKey) {
    throw new import_server.TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service API key is not configured."
    });
  }
  const endpoint = buildEndpointUrl(ENV.forgeApiUrl);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1"
      },
      body: JSON.stringify({ title, content })
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(
        `[Notification] Failed to notify owner (${response.status} ${response.statusText})${detail ? `: ${detail}` : ""}`
      );
      return false;
    }
    return true;
  } catch (error) {
    console.warn("[Notification] Error calling notification service:", error);
    return false;
  }
}

// shared/const.ts
var COOKIE_NAME = "app_session_id";
var ONE_YEAR_MS = 1e3 * 60 * 60 * 24 * 365;
var UNAUTHED_ERR_MSG = "Please login (10001)";
var NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";

// server/_core/trpc.ts
var import_server2 = require("@trpc/server");
var import_superjson = __toESM(require("superjson"), 1);
var t = import_server2.initTRPC.context().create({
  transformer: import_superjson.default
});
var router = t.router;
var publicProcedure = t.procedure;
var requireUser = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new import_server2.TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user
    }
  });
});
var protectedProcedure = t.procedure.use(requireUser);
var adminProcedure = t.procedure.use(
  t.middleware(async (opts) => {
    const { ctx, next } = opts;
    if (!ctx.user || ctx.user.role !== "admin") {
      throw new import_server2.TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user
      }
    });
  })
);

// server/_core/systemRouter.ts
var systemRouter = router({
  health: publicProcedure.input(
    import_zod.z.object({
      timestamp: import_zod.z.number().min(0, "timestamp cannot be negative")
    })
  ).query(() => ({
    ok: true
  })),
  notifyOwner: adminProcedure.input(
    import_zod.z.object({
      title: import_zod.z.string().min(1, "title is required"),
      content: import_zod.z.string().min(1, "content is required")
    })
  ).mutation(async ({ input }) => {
    const delivered = await notifyOwner(input);
    return {
      success: delivered
    };
  })
});

// server/routers/auth.ts
var import_server3 = require("@trpc/server");
var import_zod2 = require("zod");
var import_bcryptjs = __toESM(require("bcryptjs"), 1);
var import_jose = require("jose");
init_db();

// server/_core/cookies.ts
function isSecureRequest(req) {
  if (req.protocol === "https") return true;
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;
  const protoList = Array.isArray(forwardedProto) ? forwardedProto : forwardedProto.split(",");
  return protoList.some((proto) => proto.trim().toLowerCase() === "https");
}
function getSessionCookieOptions(req) {
  return {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: isSecureRequest(req)
  };
}

// server/routers/auth.ts
var ONE_YEAR_MS2 = 365 * 24 * 60 * 60 * 1e3;
function getSessionSecret() {
  const secret = process.env.JWT_SECRET || "darin-madani-secret-key-2024";
  return new TextEncoder().encode(secret);
}
async function signJWT(userId) {
  const secretKey = getSessionSecret();
  const expiresAt = Math.floor((Date.now() + ONE_YEAR_MS2) / 1e3);
  return new import_jose.SignJWT({ userId }).setProtectedHeader({ alg: "HS256", typ: "JWT" }).setExpirationTime(expiresAt).sign(secretKey);
}
var authRouter = router({
  me: publicProcedure.query(({ ctx }) => ctx.user ?? null),
  login: publicProcedure.input(import_zod2.z.object({
    username: import_zod2.z.string().min(1),
    password: import_zod2.z.string().min(1)
  })).mutation(async ({ input, ctx }) => {
    const user = await getUserByUsername(input.username);
    if (!user) {
      throw new import_server3.TRPCError({ code: "UNAUTHORIZED", message: "\u0627\u0633\u0645 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u0623\u0648 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u063A\u064A\u0631 \u0635\u062D\u064A\u062D\u0629" });
    }
    if (!user.isActive) {
      throw new import_server3.TRPCError({ code: "FORBIDDEN", message: "\u0627\u0644\u062D\u0633\u0627\u0628 \u0645\u0648\u0642\u0648\u0641. \u062A\u0648\u0627\u0635\u0644 \u0645\u0639 \u0627\u0644\u0645\u062F\u064A\u0631" });
    }
    if (!user.passwordHash) {
      throw new import_server3.TRPCError({ code: "UNAUTHORIZED", message: "\u0644\u0645 \u064A\u062A\u0645 \u062A\u0639\u064A\u064A\u0646 \u0643\u0644\u0645\u0629 \u0645\u0631\u0648\u0631 \u0644\u0647\u0630\u0627 \u0627\u0644\u062D\u0633\u0627\u0628" });
    }
    const valid = await import_bcryptjs.default.compare(input.password, user.passwordHash);
    if (!valid) {
      throw new import_server3.TRPCError({ code: "UNAUTHORIZED", message: "\u0627\u0633\u0645 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u0623\u0648 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u063A\u064A\u0631 \u0635\u062D\u064A\u062D\u0629" });
    }
    const token = await signJWT(user.id);
    const cookieOptions = getSessionCookieOptions(ctx.req);
    ctx.res.cookie(COOKIE_NAME, token, {
      ...cookieOptions,
      maxAge: ONE_YEAR_MS2
    });
    await updateUser(user.id, { lastSignedIn: /* @__PURE__ */ new Date() });
    const { passwordHash: _, ...safeUser } = user;
    return { success: true, user: safeUser };
  }),
  logout: publicProcedure.mutation(({ ctx }) => {
    const cookieOptions = getSessionCookieOptions(ctx.req);
    ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    return { success: true };
  }),
  changePassword: protectedProcedure.input(import_zod2.z.object({
    currentPassword: import_zod2.z.string().min(1),
    newPassword: import_zod2.z.string().min(6)
  })).mutation(async ({ input, ctx }) => {
    const user = await getUserById(ctx.user.id);
    if (!user?.passwordHash) throw new import_server3.TRPCError({ code: "BAD_REQUEST" });
    const valid = await import_bcryptjs.default.compare(input.currentPassword, user.passwordHash);
    if (!valid) throw new import_server3.TRPCError({ code: "UNAUTHORIZED", message: "\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0627\u0644\u062D\u0627\u0644\u064A\u0629 \u063A\u064A\u0631 \u0635\u062D\u064A\u062D\u0629" });
    const newHash = await import_bcryptjs.default.hash(input.newPassword, 12);
    await updateUser(ctx.user.id, { passwordHash: newHash });
    return { success: true };
  })
});

// server/routers/settings.ts
var import_zod3 = require("zod");
init_db();
var import_server4 = require("@trpc/server");
var adminOnly = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin" && ctx.user.role !== "manager") throw new import_server4.TRPCError({ code: "FORBIDDEN" });
  return next({ ctx });
});
var settingsRouter = router({
  get: protectedProcedure.query(async () => {
    return await getSettings();
  }),
  update: adminOnly.input(import_zod3.z.object({
    storeName: import_zod3.z.string().optional(),
    storeNameEn: import_zod3.z.string().optional(),
    storePhone: import_zod3.z.string().optional(),
    storeEmail: import_zod3.z.string().optional(),
    storeAddress: import_zod3.z.string().optional(),
    storeAddressEn: import_zod3.z.string().optional(),
    storeLogo: import_zod3.z.string().optional(),
    taxNumber: import_zod3.z.string().optional(),
    taxRate: import_zod3.z.string().optional(),
    currency: import_zod3.z.string().optional(),
    currencySymbol: import_zod3.z.string().optional(),
    invoiceNote: import_zod3.z.string().optional(),
    invoiceNoteEn: import_zod3.z.string().optional(),
    whatsappEnabled: import_zod3.z.boolean().optional(),
    whatsappInstance: import_zod3.z.string().optional(),
    whatsappApiKey: import_zod3.z.string().optional(),
    whatsappApiBase: import_zod3.z.string().optional(),
    whatsappTemplate: import_zod3.z.string().optional(),
    myfatoorahEnabled: import_zod3.z.boolean().optional(),
    myfatoorahToken: import_zod3.z.string().optional(),
    myfatoorahEnv: import_zod3.z.enum(["sandbox", "live"]).optional(),
    myfatoorahSupplier: import_zod3.z.string().optional(),
    // ثابت = 24 لـ Darin Madani
    priceIncludesTax: import_zod3.z.boolean().optional()
  })).mutation(async ({ input }) => {
    await updateSettings(input);
    return { success: true };
  }),
  // Warehouses
  getWarehouses: protectedProcedure.query(async () => {
    return await getWarehouses(false);
  }),
  createWarehouse: adminOnly.input(import_zod3.z.object({
    name: import_zod3.z.string().min(1),
    nameEn: import_zod3.z.string().optional(),
    description: import_zod3.z.string().optional(),
    isDefault: import_zod3.z.boolean().optional(),
    isActive: import_zod3.z.boolean().optional()
  })).mutation(async ({ input }) => {
    await createWarehouse(input);
    return { success: true };
  }),
  updateWarehouse: adminOnly.input(import_zod3.z.object({
    id: import_zod3.z.number(),
    name: import_zod3.z.string().optional(),
    nameEn: import_zod3.z.string().optional(),
    description: import_zod3.z.string().optional(),
    isDefault: import_zod3.z.boolean().optional(),
    isActive: import_zod3.z.boolean().optional()
  })).mutation(async ({ input: { id, ...data } }) => {
    await updateWarehouse(id, data);
    return { success: true };
  }),
  deleteWarehouse: adminOnly.input(import_zod3.z.object({ id: import_zod3.z.number() })).mutation(async ({ input }) => {
    await deleteWarehouse(input.id);
    return { success: true };
  }),
  // Categories
  getCategories: protectedProcedure.query(async () => {
    return await getCategories();
  }),
  createCategory: adminOnly.input(import_zod3.z.object({
    name: import_zod3.z.string().min(1),
    nameEn: import_zod3.z.string().optional(),
    parentId: import_zod3.z.number().optional(),
    sortOrder: import_zod3.z.number().optional()
  })).mutation(async ({ input }) => {
    await createCategory(input);
    return { success: true };
  }),
  updateCategory: adminOnly.input(import_zod3.z.object({
    id: import_zod3.z.number(),
    name: import_zod3.z.string().optional(),
    nameEn: import_zod3.z.string().optional(),
    sortOrder: import_zod3.z.number().optional(),
    isActive: import_zod3.z.boolean().optional()
  })).mutation(async ({ input: { id, ...data } }) => {
    await updateCategory(id, data);
    return { success: true };
  }),
  deleteCategory: adminOnly.input(import_zod3.z.object({ id: import_zod3.z.number() })).mutation(async ({ input }) => {
    await deleteCategory(input.id);
    return { success: true };
  }),
  // Discounts
  getDiscounts: protectedProcedure.query(async () => {
    return await getDiscounts(false);
  }),
  createDiscount: adminOnly.input(import_zod3.z.object({
    name: import_zod3.z.string().min(1),
    nameEn: import_zod3.z.string().optional(),
    type: import_zod3.z.enum(["percentage", "fixed"]),
    value: import_zod3.z.string(),
    minPurchase: import_zod3.z.string().optional(),
    maxUses: import_zod3.z.number().optional(),
    isActive: import_zod3.z.boolean().optional(),
    startDate: import_zod3.z.date().optional(),
    endDate: import_zod3.z.date().optional()
  })).mutation(async ({ input }) => {
    await createDiscount(input);
    return { success: true };
  }),
  updateDiscount: adminOnly.input(import_zod3.z.object({
    id: import_zod3.z.number(),
    name: import_zod3.z.string().optional(),
    nameEn: import_zod3.z.string().optional(),
    type: import_zod3.z.enum(["percentage", "fixed"]).optional(),
    value: import_zod3.z.string().optional(),
    minPurchase: import_zod3.z.string().optional(),
    maxUses: import_zod3.z.number().optional(),
    isActive: import_zod3.z.boolean().optional(),
    startDate: import_zod3.z.date().optional(),
    endDate: import_zod3.z.date().optional()
  })).mutation(async ({ input: { id, ...data } }) => {
    await updateDiscount(id, data);
    return { success: true };
  }),
  deleteDiscount: adminOnly.input(import_zod3.z.object({ id: import_zod3.z.number() })).mutation(async ({ input }) => {
    await deleteDiscount(input.id);
    return { success: true };
  })
});

// server/routers/products.ts
var import_zod4 = require("zod");
var import_server5 = require("@trpc/server");
init_db();
var import_nanoid = require("nanoid");
var adminOrManager = protectedProcedure.use(({ ctx, next }) => {
  if (!["admin", "manager", "warehouse"].includes(ctx.user.role))
    throw new import_server5.TRPCError({ code: "FORBIDDEN" });
  return next({ ctx });
});
var productsRouter = router({
  list: protectedProcedure.input(import_zod4.z.object({
    search: import_zod4.z.string().optional(),
    categoryId: import_zod4.z.number().optional(),
    warehouseId: import_zod4.z.number().optional(),
    lowStock: import_zod4.z.boolean().optional()
  }).optional()).query(async ({ input }) => {
    return await getProducts(input);
  }),
  get: protectedProcedure.input(import_zod4.z.object({ id: import_zod4.z.number() })).query(async ({ input }) => {
    const p = await getProductById(input.id);
    if (!p) throw new import_server5.TRPCError({ code: "NOT_FOUND" });
    return p;
  }),
  getByBarcode: protectedProcedure.input(import_zod4.z.object({ barcode: import_zod4.z.string() })).query(async ({ input }) => {
    const p = await getProductByBarcode(input.barcode);
    if (!p) throw new import_server5.TRPCError({ code: "NOT_FOUND", message: "Product not found" });
    return p;
  }),
  create: adminOrManager.input(import_zod4.z.object({
    name: import_zod4.z.string().min(1),
    nameEn: import_zod4.z.string().optional(),
    description: import_zod4.z.string().optional(),
    descriptionEn: import_zod4.z.string().optional(),
    categoryId: import_zod4.z.number().optional(),
    color: import_zod4.z.string().optional(),
    colorEn: import_zod4.z.string().optional(),
    colorHex: import_zod4.z.string().optional(),
    size: import_zod4.z.string().optional(),
    costPrice: import_zod4.z.string().optional(),
    salePrice: import_zod4.z.string(),
    images: import_zod4.z.array(import_zod4.z.string()).optional(),
    lowStockAlert: import_zod4.z.number().optional(),
    sku: import_zod4.z.string().optional(),
    // Initial stock per warehouse
    initialStock: import_zod4.z.array(import_zod4.z.object({ warehouseId: import_zod4.z.number(), qty: import_zod4.z.number() })).optional()
  })).mutation(async ({ input, ctx }) => {
    const { initialStock, ...productData } = input;
    const barcode = `DM${Date.now()}${Math.floor(Math.random() * 100)}`;
    const sku = productData.sku || `SKU-${(0, import_nanoid.nanoid)(8).toUpperCase()}`;
    const id = await createProduct({ ...productData, barcode, sku, images: productData.images || [] });
    if (!id) throw new import_server5.TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    if (initialStock?.length) {
      for (const s of initialStock) {
        if (s.qty > 0) {
          await setProductStock(id, s.warehouseId, s.qty);
          await addStockMovement({ productId: id, warehouseId: s.warehouseId, type: "purchase", qty: s.qty, userId: ctx.user.id, reference: sku });
        }
      }
    }
    return { success: true, id };
  }),
  update: adminOrManager.input(import_zod4.z.object({
    id: import_zod4.z.number(),
    name: import_zod4.z.string().optional(),
    nameEn: import_zod4.z.string().optional(),
    description: import_zod4.z.string().optional(),
    descriptionEn: import_zod4.z.string().optional(),
    categoryId: import_zod4.z.number().optional().nullable(),
    color: import_zod4.z.string().optional(),
    colorEn: import_zod4.z.string().optional(),
    colorHex: import_zod4.z.string().optional(),
    size: import_zod4.z.string().optional(),
    costPrice: import_zod4.z.string().optional(),
    salePrice: import_zod4.z.string().optional(),
    images: import_zod4.z.array(import_zod4.z.string()).optional(),
    lowStockAlert: import_zod4.z.number().optional(),
    isActive: import_zod4.z.boolean().optional()
  })).mutation(async ({ input: { id, ...data } }) => {
    await updateProduct(id, data);
    return { success: true };
  }),
  delete: adminOrManager.input(import_zod4.z.object({ id: import_zod4.z.number() })).mutation(async ({ input }) => {
    await deleteProduct(input.id);
    return { success: true };
  }),
  // Stock management
  getStock: protectedProcedure.input(import_zod4.z.object({
    productId: import_zod4.z.number().optional(),
    warehouseId: import_zod4.z.number().optional()
  })).query(async ({ input }) => {
    if (input.productId) return await getProductStock(input.productId, input.warehouseId);
    return [];
  }),
  addPurchase: adminOrManager.input(import_zod4.z.object({
    productId: import_zod4.z.number(),
    warehouseId: import_zod4.z.number(),
    qty: import_zod4.z.number().min(1),
    costPrice: import_zod4.z.string().optional(),
    notes: import_zod4.z.string().optional(),
    reference: import_zod4.z.string().optional()
  })).mutation(async ({ input, ctx }) => {
    await upsertProductStock(input.productId, input.warehouseId, input.qty);
    await addStockMovement({
      productId: input.productId,
      warehouseId: input.warehouseId,
      type: "purchase",
      qty: input.qty,
      costPrice: input.costPrice,
      notes: input.notes,
      reference: input.reference,
      userId: ctx.user.id
    });
    return { success: true };
  }),
  transferStock: adminOrManager.input(import_zod4.z.object({
    productId: import_zod4.z.number(),
    fromWarehouseId: import_zod4.z.number(),
    toWarehouseId: import_zod4.z.number(),
    qty: import_zod4.z.number().min(1),
    notes: import_zod4.z.string().optional()
  })).mutation(async ({ input, ctx }) => {
    const fromStock = await getProductStock(input.productId, input.fromWarehouseId);
    const available = fromStock[0]?.qty || 0;
    if (available < input.qty) throw new import_server5.TRPCError({ code: "BAD_REQUEST", message: "Insufficient stock" });
    await upsertProductStock(input.productId, input.fromWarehouseId, -input.qty);
    await upsertProductStock(input.productId, input.toWarehouseId, input.qty);
    await addStockMovement({
      productId: input.productId,
      warehouseId: input.fromWarehouseId,
      toWarehouseId: input.toWarehouseId,
      type: "transfer",
      qty: input.qty,
      notes: input.notes,
      userId: ctx.user.id
    });
    return { success: true };
  }),
  adjustStock: adminOrManager.input(import_zod4.z.object({
    productId: import_zod4.z.number(),
    warehouseId: import_zod4.z.number(),
    newQty: import_zod4.z.number().min(0),
    notes: import_zod4.z.string().optional()
  })).mutation(async ({ input, ctx }) => {
    const current = await getProductStock(input.productId, input.warehouseId);
    const currentQty = current[0]?.qty || 0;
    const diff = input.newQty - currentQty;
    await setProductStock(input.productId, input.warehouseId, input.newQty);
    await addStockMovement({
      productId: input.productId,
      warehouseId: input.warehouseId,
      type: "adjustment",
      qty: diff,
      notes: input.notes,
      userId: ctx.user.id
    });
    return { success: true };
  }),
  getMovements: protectedProcedure.input(import_zod4.z.object({
    productId: import_zod4.z.number().optional(),
    warehouseId: import_zod4.z.number().optional()
  })).query(async ({ input }) => {
    return await getStockMovements(input.productId, input.warehouseId);
  }),
  // ─── BARCODE SERIALS ─────────────────────────────────────────────────────────────
  /**
   * Reserve N sequential serial numbers for a variant barcode.
   * Returns array of serial numbers to print on labels.
   */
  reserveSerials: adminOrManager.input(import_zod4.z.object({
    variantBarcode: import_zod4.z.string().min(1),
    qty: import_zod4.z.number().min(1).max(500)
  })).mutation(async ({ input }) => {
    const serials = await reserveBarcodeSerials(input.variantBarcode, input.qty);
    return { serials, variantBarcode: input.variantBarcode };
  }),
  /**
   * Get the last allocated serial for a variant barcode (for preview).
   */
  getLastSerial: protectedProcedure.input(import_zod4.z.object({
    variantBarcode: import_zod4.z.string().min(1)
  })).query(async ({ input }) => {
    const lastSerial = await getLastBarcodeSerial(input.variantBarcode);
    return { lastSerial, variantBarcode: input.variantBarcode };
  }),
  // ─── PRODUCT VARIANTS ─────────────────────────────────────────────────────────────
  /**
   * Get all variants of a product (same name, different color/size)
   * with stock per warehouse.
   */
  getVariants: protectedProcedure.input(import_zod4.z.object({
    productId: import_zod4.z.number()
  })).query(async ({ input }) => {
    return await getProductVariants(input.productId);
  })
});

// server/routers/customers.ts
var import_zod5 = require("zod");
var import_server6 = require("@trpc/server");
init_db();
var customersRouter = router({
  list: protectedProcedure.input(import_zod5.z.object({ search: import_zod5.z.string().optional() }).optional()).query(async ({ input }) => {
    return await getCustomers(input?.search);
  }),
  get: protectedProcedure.input(import_zod5.z.object({ id: import_zod5.z.number() })).query(async ({ input }) => {
    const c = await getCustomerById(input.id);
    if (!c) throw new import_server6.TRPCError({ code: "NOT_FOUND" });
    const invoiceList = await getInvoices({ customerId: input.id });
    return { ...c, invoices: invoiceList };
  }),
  create: protectedProcedure.input(import_zod5.z.object({
    name: import_zod5.z.string().min(1),
    phone: import_zod5.z.string().optional(),
    email: import_zod5.z.string().optional(),
    city: import_zod5.z.string().optional(),
    address: import_zod5.z.string().optional(),
    notes: import_zod5.z.string().optional()
  })).mutation(async ({ input }) => {
    const id = await createCustomer(input);
    return { success: true, id };
  }),
  update: protectedProcedure.input(import_zod5.z.object({
    id: import_zod5.z.number(),
    name: import_zod5.z.string().optional(),
    phone: import_zod5.z.string().optional(),
    email: import_zod5.z.string().optional(),
    city: import_zod5.z.string().optional(),
    address: import_zod5.z.string().optional(),
    notes: import_zod5.z.string().optional()
  })).mutation(async ({ input: { id, ...data } }) => {
    await updateCustomer(id, data);
    return { success: true };
  }),
  delete: protectedProcedure.input(import_zod5.z.object({ id: import_zod5.z.number() })).mutation(async ({ input }) => {
    await deleteCustomer(input.id);
    return { success: true };
  }),
  // Discounts
  listDiscounts: protectedProcedure.input(import_zod5.z.object({ activeOnly: import_zod5.z.boolean().optional() }).optional()).query(async ({ input }) => {
    return await getDiscounts(input?.activeOnly);
  }),
  createDiscount: protectedProcedure.input(import_zod5.z.object({
    name: import_zod5.z.string().min(1),
    nameEn: import_zod5.z.string().optional(),
    type: import_zod5.z.enum(["percentage", "fixed"]),
    value: import_zod5.z.string(),
    minAmount: import_zod5.z.string().optional(),
    maxUses: import_zod5.z.number().optional(),
    isActive: import_zod5.z.boolean().optional(),
    startDate: import_zod5.z.date().optional(),
    endDate: import_zod5.z.date().optional()
  })).mutation(async ({ input }) => {
    const id = await createDiscount(input);
    return { success: true, id };
  }),
  updateDiscount: protectedProcedure.input(import_zod5.z.object({
    id: import_zod5.z.number(),
    name: import_zod5.z.string().optional(),
    nameEn: import_zod5.z.string().optional(),
    type: import_zod5.z.enum(["percentage", "fixed"]).optional(),
    value: import_zod5.z.string().optional(),
    minAmount: import_zod5.z.string().optional(),
    maxUses: import_zod5.z.number().optional(),
    isActive: import_zod5.z.boolean().optional(),
    startDate: import_zod5.z.date().optional(),
    endDate: import_zod5.z.date().optional()
  })).mutation(async ({ input: { id, ...data } }) => {
    await updateDiscount(id, data);
    return { success: true };
  }),
  deleteDiscount: protectedProcedure.input(import_zod5.z.object({ id: import_zod5.z.number() })).mutation(async ({ input }) => {
    await deleteDiscount(input.id);
    return { success: true };
  })
});

// server/routers/invoices.ts
var import_zod6 = require("zod");
var import_drizzle_orm2 = require("drizzle-orm");
var import_server7 = require("@trpc/server");
init_db();
var import_nanoid2 = require("nanoid");
var import_axios = __toESM(require("axios"), 1);
async function sendWhatsApp(phone, message, settings2) {
  const instanceName = settings2?.whatsappInstance;
  if (!instanceName) {
    console.log("[WhatsApp] No instance configured");
    return false;
  }
  const base = process.env.WHATSAPP_API_BASE || settings2?.whatsappApiBase || "https://elv.academy-smart.com";
  const apiKey = process.env.WHATSAPP_API_KEY || settings2?.whatsappApiKey || "BQYHJGJHJ";
  try {
    let num = phone.replace(/[^0-9]/g, "");
    if (num.startsWith("0") && num.length === 10) num = "966" + num.slice(1);
    else if (num.length === 9) num = "966" + num;
    if (num.length < 10) {
      console.log("[WhatsApp] Invalid phone number:", phone);
      return false;
    }
    console.log(`[WhatsApp] Sending to ${num} via instance ${instanceName}`);
    const res = await import_axios.default.post(
      `${base}/message/sendText/${instanceName}`,
      { number: num, text: message },
      { headers: { "Content-Type": "application/json", apikey: apiKey }, timeout: 15e3 }
    );
    console.log(`[WhatsApp] Response: ${res.status}`, JSON.stringify(res.data).slice(0, 200));
    return res.status >= 200 && res.status < 300;
  } catch (e) {
    console.error("[WhatsApp] Send error:", e?.response?.data || e?.message);
    return false;
  }
}
async function createMyfatoorahPayment(invoice, settings2, origin) {
  if (!settings2?.myfatoorahToken) return null;
  const supplierCode = settings2.myfatoorahSupplier ? Number(settings2.myfatoorahSupplier) : 24;
  const isLive = settings2.myfatoorahEnv === "live";
  const base = isLive ? "https://api.myfatoorah.com" : "https://apitest.myfatoorah.com";
  const callbackUrl = `${origin}/api/payment-callback?invoice_id=${invoice.id}`;
  const amount = parseFloat(invoice.total);
  let mobile = (invoice.customerPhone || "").replace(/[^0-9]/g, "");
  if (mobile.startsWith("0") && mobile.length === 10) mobile = "966" + mobile.slice(1);
  else if (mobile.length === 9) mobile = "966" + mobile;
  const payload = {
    CustomerName: invoice.customerName || "\u0639\u0645\u064A\u0644",
    NotificationOption: mobile ? "SMS" : "LNK",
    InvoiceValue: amount,
    DisplayCurrencyIso: "SAR",
    MobileCountryCode: "+966",
    CustomerMobile: mobile || "0500000000",
    CustomerEmail: invoice.customerEmail || "noreply@darinmadani.com",
    CallBackUrl: callbackUrl,
    ErrorUrl: callbackUrl + "&status=error",
    Language: "AR",
    CustomerReference: invoice.invoiceNumber,
    InvoiceItems: [{ ItemName: `\u0641\u0627\u062A\u0648\u0631\u0629 \u0631\u0642\u0645 ${invoice.invoiceNumber}`, Quantity: 1, UnitPrice: amount }],
    // Supplier Code ثابت = 24
    Suppliers: [{ SupplierCode: supplierCode, InvoiceShare: amount, ProposedShare: null }]
  };
  try {
    const res = await import_axios.default.post(`${base}/v2/SendPayment`, payload, {
      headers: { Authorization: `Bearer ${settings2.myfatoorahToken}`, "Content-Type": "application/json" },
      timeout: 3e4
    });
    const data = res.data?.Data;
    return { invoiceId: data?.InvoiceId, paymentUrl: data?.InvoiceURL, qrCode: data?.QrCodeUrl };
  } catch (e) {
    const errMsg = e?.response?.data?.Message || e?.response?.data?.ValidationErrors?.[0]?.Error || e.message;
    console.error("MyFatoorah error:", errMsg);
    return null;
  }
}
var invoicesRouter = router({
  list: protectedProcedure.input(import_zod6.z.object({
    search: import_zod6.z.string().optional(),
    status: import_zod6.z.string().optional(),
    from: import_zod6.z.date().optional(),
    to: import_zod6.z.date().optional(),
    customerId: import_zod6.z.number().optional()
  }).optional()).query(async ({ input }) => {
    return await getInvoices(input);
  }),
  get: protectedProcedure.input(import_zod6.z.object({ id: import_zod6.z.number() })).query(async ({ input }) => {
    const inv = await getInvoiceById(input.id);
    if (!inv) throw new import_server7.TRPCError({ code: "NOT_FOUND" });
    return inv;
  }),
  getByToken: publicProcedure.input(import_zod6.z.object({ token: import_zod6.z.string() })).query(async ({ input }) => {
    const inv = await getInvoiceByToken(input.token);
    if (!inv) throw new import_server7.TRPCError({ code: "NOT_FOUND" });
    return inv;
  }),
  create: protectedProcedure.input(import_zod6.z.object({
    customerId: import_zod6.z.number().optional(),
    customerName: import_zod6.z.string().optional(),
    customerPhone: import_zod6.z.string().optional(),
    warehouseId: import_zod6.z.number().optional(),
    items: import_zod6.z.array(import_zod6.z.object({
      productId: import_zod6.z.number().optional(),
      productName: import_zod6.z.string(),
      productNameEn: import_zod6.z.string().optional(),
      barcode: import_zod6.z.string().optional(),
      color: import_zod6.z.string().optional(),
      size: import_zod6.z.string().optional(),
      qty: import_zod6.z.number().min(1),
      unitPrice: import_zod6.z.string(),
      discountPct: import_zod6.z.string().optional(),
      lineTotal: import_zod6.z.string()
    })),
    subtotal: import_zod6.z.string(),
    discountType: import_zod6.z.enum(["percentage", "fixed", "none"]).optional(),
    discountValue: import_zod6.z.string().optional(),
    discountAmount: import_zod6.z.string().optional(),
    discountId: import_zod6.z.number().optional(),
    taxRate: import_zod6.z.string().optional(),
    taxAmount: import_zod6.z.string().optional(),
    total: import_zod6.z.string(),
    paymentMethod: import_zod6.z.enum(["cash", "card", "transfer", "electronic", "mixed"]).optional(),
    paymentSplits: import_zod6.z.array(import_zod6.z.object({
      method: import_zod6.z.enum(["cash", "card", "transfer", "electronic"]),
      amount: import_zod6.z.string()
    })).optional(),
    notes: import_zod6.z.string().optional(),
    origin: import_zod6.z.string().optional()
  })).mutation(async ({ input, ctx }) => {
    const invoiceNumber = await generateInvoiceNumber();
    const token = (0, import_nanoid2.nanoid)(32);
    const settings2 = await getSettings();
    const invoiceData = {
      invoiceNumber,
      token,
      customerId: input.customerId,
      customerName: input.customerName,
      customerPhone: input.customerPhone,
      warehouseId: input.warehouseId || 1,
      subtotal: input.subtotal,
      discountType: input.discountType || "none",
      discountValue: input.discountValue || "0",
      discountAmount: input.discountAmount || "0",
      discountId: input.discountId,
      taxRate: input.taxRate || "0",
      taxAmount: input.taxAmount || "0",
      total: input.total,
      paymentMethod: input.paymentMethod || "cash",
      // Electronic payments start as pending until confirmed by MyFatoorah callback
      paymentStatus: input.paymentMethod === "electronic" ? "pending" : "paid",
      status: "completed",
      notes: input.notes,
      cashierId: ctx.user.id
    };
    const id = await createInvoice(invoiceData, input.items);
    if (!id) throw new import_server7.TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    if (input.paymentMethod === "mixed" && input.paymentSplits && input.paymentSplits.length > 0) {
      const db = await getDb();
      if (db) {
        for (const split of input.paymentSplits) {
          if (parseFloat(split.amount) > 0) {
            const invoiceId = id;
            const method = split.method;
            const amount = split.amount;
            await db.execute(import_drizzle_orm2.sql`INSERT INTO invoice_payments (invoiceId, method, amount, createdAt) VALUES (${invoiceId}, ${method}, ${amount}, NOW())`);
          }
        }
      }
    }
    const warehouseId = input.warehouseId || 1;
    for (const item of input.items) {
      if (item.productId) {
        await upsertProductStock(item.productId, warehouseId, -item.qty);
        await addStockMovement({
          productId: item.productId,
          warehouseId,
          type: "sale",
          qty: -item.qty,
          reference: invoiceNumber,
          userId: ctx.user.id
        });
      }
    }
    if (input.customerId) {
      const customer = await getCustomerById(input.customerId);
      if (customer) {
        const newTotal = (parseFloat(String(customer.totalSpent || "0")) + parseFloat(input.total)).toFixed(2);
        await updateCustomer(input.customerId, { totalSpent: newTotal, points: (customer.points || 0) + Math.floor(parseFloat(input.total)) });
      }
    }
    let mfData = null;
    if (input.paymentMethod === "electronic" && input.origin) {
      const inv = await getInvoiceById(id);
      mfData = await createMyfatoorahPayment({ ...inv, invoiceNumber, total: input.total, customerName: input.customerName, customerPhone: input.customerPhone }, settings2, input.origin);
      if (mfData) {
        await updateInvoice(id, { mfInvoiceId: String(mfData.invoiceId), mfPaymentUrl: mfData.paymentUrl, mfQrCode: mfData.qrCode });
      }
    }
    return { success: true, id, invoiceNumber, token, mfData };
  }),
  sendWhatsApp: protectedProcedure.input(import_zod6.z.object({
    invoiceId: import_zod6.z.number(),
    phone: import_zod6.z.string(),
    message: import_zod6.z.string().optional(),
    origin: import_zod6.z.string().optional()
  })).mutation(async ({ input }) => {
    const settings2 = await getSettings();
    const inv = await getInvoiceById(input.invoiceId);
    if (!inv) throw new import_server7.TRPCError({ code: "NOT_FOUND" });
    const storeName = settings2?.storeName || "Darin Madani Fashion House";
    const currency = settings2?.currencySymbol || "\u0631.\u0633";
    const siteBase = input.origin || process.env.SITE_URL || "https://darinpos-guiq96ki.manus.space";
    const invoiceUrl = `${siteBase}/invoice/${inv.token}`;
    const template = settings2?.whatsappTemplate || `\u{1F6CD}\uFE0F \u0634\u0643\u0631\u0627\u064B \u0644\u062A\u0633\u0648\u0642\u0643 \u0641\u064A *{storeName}*

\u0641\u0627\u062A\u0648\u0631\u0629 \u0631\u0642\u0645: *{invoiceNumber}*
\u0627\u0644\u0625\u062C\u0645\u0627\u0644\u064A: *{total} {currency}*

\u{1F4C4} \u0631\u0627\u0628\u0637 \u0627\u0644\u0641\u0627\u062A\u0648\u0631\u0629:
{invoiceUrl}

\u0646\u062A\u0637\u0644\u0639 \u0644\u062E\u062F\u0645\u062A\u0643 \u062F\u0627\u0626\u0645\u0627\u064B \u{1F49B}`;
    const message = input.message || template.replace("{storeName}", storeName).replace("{invoiceNumber}", inv.invoiceNumber).replace("{total}", inv.total).replace("{currency}", currency).replace("{invoiceUrl}", invoiceUrl);
    const sent = await sendWhatsApp(input.phone, message, settings2);
    if (sent) {
      await updateInvoice(input.invoiceId, { whatsappSent: true, whatsappSentAt: /* @__PURE__ */ new Date() });
      return { success: true };
    } else {
      if (!settings2?.whatsappInstance) {
        throw new import_server7.TRPCError({ code: "PRECONDITION_FAILED", message: "\u0648\u0627\u062A\u0633\u0627\u0628 \u063A\u064A\u0631 \u0645\u0631\u0628\u0648\u0637. \u064A\u0631\u062C\u0649 \u0631\u0628\u0637 \u0627\u0644\u0648\u0627\u062A\u0633\u0627\u0628 \u0645\u0646 \u0635\u0641\u062D\u0629 \u0627\u0644\u0625\u0639\u062F\u0627\u062F\u0627\u062A" });
      }
      throw new import_server7.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "\u0641\u0634\u0644 \u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0631\u0633\u0627\u0644\u0629 \u0639\u0628\u0631 \u0648\u0627\u062A\u0633\u0627\u0628. \u062A\u062D\u0642\u0642 \u0645\u0646 \u0627\u062A\u0635\u0627\u0644 \u0627\u0644\u0648\u0627\u062A\u0633\u0627\u0628 \u0648\u0631\u0642\u0645 \u0627\u0644\u0647\u0627\u062A\u0641" });
    }
  }),
  createPaymentLink: protectedProcedure.input(import_zod6.z.object({
    invoiceId: import_zod6.z.number(),
    origin: import_zod6.z.string()
  })).mutation(async ({ input }) => {
    const settings2 = await getSettings();
    const inv = await getInvoiceById(input.invoiceId);
    if (!inv) throw new import_server7.TRPCError({ code: "NOT_FOUND" });
    const mfData = await createMyfatoorahPayment(inv, settings2, input.origin);
    if (!mfData) throw new import_server7.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Payment gateway error" });
    await updateInvoice(input.invoiceId, { mfInvoiceId: String(mfData.invoiceId), mfPaymentUrl: mfData.paymentUrl, mfQrCode: mfData.qrCode });
    return { success: true, ...mfData };
  }),
  cancel: protectedProcedure.input(import_zod6.z.object({ id: import_zod6.z.number() })).mutation(async ({ input }) => {
    await updateInvoice(input.id, { status: "cancelled" });
    return { success: true };
  }),
  // Returns
  listReturns: protectedProcedure.input(import_zod6.z.object({ search: import_zod6.z.string().optional() }).optional()).query(async ({ input }) => {
    return await getReturns(input?.search);
  }),
  getReturn: protectedProcedure.input(import_zod6.z.object({ id: import_zod6.z.number() })).query(async ({ input }) => {
    const r = await getReturnById(input.id);
    if (!r) throw new import_server7.TRPCError({ code: "NOT_FOUND" });
    return r;
  }),
  createReturn: protectedProcedure.input(import_zod6.z.object({
    invoiceId: import_zod6.z.number(),
    invoiceNumber: import_zod6.z.string().optional(),
    customerId: import_zod6.z.number().optional(),
    customerName: import_zod6.z.string().optional(),
    warehouseId: import_zod6.z.number().optional(),
    items: import_zod6.z.array(import_zod6.z.object({
      productId: import_zod6.z.number().optional(),
      productName: import_zod6.z.string(),
      barcode: import_zod6.z.string().optional(),
      color: import_zod6.z.string().optional(),
      size: import_zod6.z.string().optional(),
      qty: import_zod6.z.number().min(1),
      unitPrice: import_zod6.z.string(),
      lineTotal: import_zod6.z.string()
    })),
    refundAmount: import_zod6.z.string(),
    refundMethod: import_zod6.z.enum(["cash", "card", "transfer", "credit"]).optional(),
    reason: import_zod6.z.string().optional()
  })).mutation(async ({ input, ctx }) => {
    const returnNumber = await generateReturnNumber();
    const id = await createReturn({
      returnNumber,
      invoiceId: input.invoiceId,
      invoiceNumber: input.invoiceNumber,
      customerId: input.customerId,
      customerName: input.customerName,
      warehouseId: input.warehouseId || 1,
      refundAmount: input.refundAmount,
      refundMethod: input.refundMethod || "cash",
      reason: input.reason,
      status: "completed",
      processedBy: ctx.user.id
    }, input.items);
    if (!id) throw new import_server7.TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    const warehouseId = input.warehouseId || 1;
    for (const item of input.items) {
      if (item.productId) {
        await upsertProductStock(item.productId, warehouseId, item.qty);
        await addStockMovement({
          productId: item.productId,
          warehouseId,
          type: "return",
          qty: item.qty,
          reference: returnNumber,
          userId: ctx.user.id
        });
      }
    }
    await updateInvoice(input.invoiceId, { status: "returned", paymentStatus: "refunded" });
    return { success: true, id, returnNumber };
  }),
  // ─── Check MyFatoorah payment status (for polling from frontend) ──────────
  checkPaymentStatus: protectedProcedure.input(import_zod6.z.object({
    invoiceId: import_zod6.z.number()
  })).query(async ({ input }) => {
    const inv = await getInvoiceById(input.invoiceId);
    if (!inv) throw new import_server7.TRPCError({ code: "NOT_FOUND" });
    if (inv.paymentStatus === "paid" && inv.mfStatus === "CAPTURED") {
      return { paid: true, paymentStatus: "paid", mfStatus: "CAPTURED", mfPaymentUrl: inv.mfPaymentUrl, mfQrCode: inv.mfQrCode };
    }
    if (!inv.mfInvoiceId) {
      return { paid: inv.paymentStatus === "paid", paymentStatus: inv.paymentStatus, mfStatus: inv.mfStatus, mfPaymentUrl: inv.mfPaymentUrl, mfQrCode: inv.mfQrCode };
    }
    const settings2 = await getSettings();
    if (!settings2?.myfatoorahToken) {
      return { paid: inv.paymentStatus === "paid", paymentStatus: inv.paymentStatus, mfStatus: inv.mfStatus, mfPaymentUrl: inv.mfPaymentUrl, mfQrCode: inv.mfQrCode };
    }
    try {
      const isLive = settings2.myfatoorahEnv === "live";
      const base = isLive ? "https://api.myfatoorah.com" : "https://apitest.myfatoorah.com";
      const res = await import_axios.default.post(
        `${base}/v2/GetPaymentStatus`,
        { Key: inv.mfInvoiceId, KeyType: "InvoiceId" },
        { headers: { Authorization: `Bearer ${settings2.myfatoorahToken}`, "Content-Type": "application/json" }, timeout: 1e4 }
      );
      const data = res.data?.Data;
      const mfStatus = data?.InvoiceStatus || "";
      const transStatus = data?.InvoiceTransactions?.[0]?.TransactionStatus || "";
      const isPaid = mfStatus === "Paid" || transStatus === "Succss" || transStatus === "Success";
      if (isPaid && inv.paymentStatus !== "paid") {
        await updateInvoice(input.invoiceId, { paymentStatus: "paid", mfStatus: "CAPTURED" });
      }
      return {
        paid: isPaid,
        paymentStatus: isPaid ? "paid" : inv.paymentStatus || "pending",
        mfStatus: isPaid ? "CAPTURED" : mfStatus,
        mfPaymentUrl: inv.mfPaymentUrl,
        mfQrCode: inv.mfQrCode
      };
    } catch (e) {
      console.error("[MF] checkPaymentStatus error:", e?.message);
      return { paid: inv.paymentStatus === "paid", paymentStatus: inv.paymentStatus, mfStatus: inv.mfStatus, mfPaymentUrl: inv.mfPaymentUrl, mfQrCode: inv.mfQrCode };
    }
  })
});

// server/routers/users.ts
var import_zod7 = require("zod");
var import_server8 = require("@trpc/server");
init_db();
var import_bcryptjs2 = __toESM(require("bcryptjs"), 1);
var adminOnly2 = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") throw new import_server8.TRPCError({ code: "FORBIDDEN" });
  return next({ ctx });
});
async function hashPassword(password) {
  return import_bcryptjs2.default.hash(password, 12);
}
var usersRouter = router({
  list: adminOnly2.query(async () => {
    const users2 = await getAllUsers();
    return users2.map((u) => ({ ...u, passwordHash: void 0 }));
  }),
  get: adminOnly2.input(import_zod7.z.object({ id: import_zod7.z.number() })).query(async ({ input }) => {
    const u = await getUserById(input.id);
    if (!u) throw new import_server8.TRPCError({ code: "NOT_FOUND" });
    const permissions = await getUserPermissions(u.id);
    return { ...u, passwordHash: void 0, permissions };
  }),
  create: adminOnly2.input(import_zod7.z.object({
    username: import_zod7.z.string().min(3),
    password: import_zod7.z.string().min(4),
    name: import_zod7.z.string().min(1),
    nameEn: import_zod7.z.string().optional(),
    email: import_zod7.z.string().optional(),
    phone: import_zod7.z.string().optional(),
    role: import_zod7.z.enum(["admin", "manager", "cashier", "warehouse"]),
    isActive: import_zod7.z.boolean().optional(),
    language: import_zod7.z.enum(["ar", "en"]).optional(),
    permissions: import_zod7.z.array(import_zod7.z.object({
      module: import_zod7.z.string(),
      action: import_zod7.z.string(),
      allowed: import_zod7.z.boolean()
    })).optional()
  })).mutation(async ({ input }) => {
    const { password, permissions, ...userData } = input;
    const openId = `local_${input.username}_${Date.now()}`;
    await upsertUser({
      ...userData,
      openId,
      passwordHash: await hashPassword(password),
      loginMethod: "local",
      isActive: input.isActive !== false
    });
    const users2 = await getAllUsers();
    const newUser = users2.find((u) => u.username === input.username);
    if (newUser && permissions?.length) {
      await setUserPermissions(newUser.id, permissions);
    }
    return { success: true };
  }),
  update: adminOnly2.input(import_zod7.z.object({
    id: import_zod7.z.number(),
    name: import_zod7.z.string().optional(),
    nameEn: import_zod7.z.string().optional(),
    email: import_zod7.z.string().optional(),
    phone: import_zod7.z.string().optional(),
    role: import_zod7.z.enum(["admin", "manager", "cashier", "warehouse"]).optional(),
    isActive: import_zod7.z.boolean().optional(),
    language: import_zod7.z.enum(["ar", "en"]).optional(),
    password: import_zod7.z.string().optional(),
    permissions: import_zod7.z.array(import_zod7.z.object({
      module: import_zod7.z.string(),
      action: import_zod7.z.string(),
      allowed: import_zod7.z.boolean()
    })).optional()
  })).mutation(async ({ input: { id, password, permissions, ...data } }) => {
    const updateData = { ...data };
    if (password) updateData.passwordHash = await hashPassword(password);
    await updateUser(id, updateData);
    if (permissions) await setUserPermissions(id, permissions);
    return { success: true };
  }),
  delete: adminOnly2.input(import_zod7.z.object({ id: import_zod7.z.number() })).mutation(async ({ input, ctx }) => {
    if (input.id === ctx.user.id) throw new import_server8.TRPCError({ code: "BAD_REQUEST", message: "Cannot delete yourself" });
    await deleteUser(input.id);
    return { success: true };
  }),
  getPermissions: adminOnly2.input(import_zod7.z.object({ userId: import_zod7.z.number() })).query(async ({ input }) => {
    return await getUserPermissions(input.userId);
  }),
  setPermissions: adminOnly2.input(import_zod7.z.object({
    userId: import_zod7.z.number(),
    permissions: import_zod7.z.array(import_zod7.z.object({
      module: import_zod7.z.string(),
      action: import_zod7.z.string(),
      allowed: import_zod7.z.boolean()
    }))
  })).mutation(async ({ input }) => {
    await setUserPermissions(input.userId, input.permissions);
    return { success: true };
  }),
  // Reports
  dashboardStats: protectedProcedure.query(async () => {
    return await getDashboardStats();
  }),
  topProducts: protectedProcedure.input(import_zod7.z.object({ limit: import_zod7.z.number().optional() }).optional()).query(async ({ input }) => {
    return await getTopProducts(input?.limit);
  }),
  monthlySales: protectedProcedure.input(import_zod7.z.object({ months: import_zod7.z.number().optional() }).optional()).query(async ({ input }) => {
    return await getMonthlySales(input?.months);
  }),
  lowStockProducts: protectedProcedure.query(async () => {
    return await getLowStockProducts();
  }),
  // Current user profile
  updateProfile: protectedProcedure.input(import_zod7.z.object({
    name: import_zod7.z.string().optional(),
    language: import_zod7.z.enum(["ar", "en"]).optional(),
    phone: import_zod7.z.string().optional()
  })).mutation(async ({ input, ctx }) => {
    await updateUser(ctx.user.id, input);
    return { success: true };
  })
});

// server/routers/whatsapp.ts
var import_zod8 = require("zod");
init_db();
init_schema();
var import_drizzle_orm3 = require("drizzle-orm");
var EVO_BASE = process.env.WHATSAPP_API_BASE || "https://elv.academy-smart.com";
var EVO_APIKEY = process.env.WHATSAPP_API_KEY || "BQYHJGJHJ";
async function evoFetch(path2, method = "GET", body) {
  const res = await fetch(`${EVO_BASE}${path2}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      apikey: EVO_APIKEY
    },
    body: body ? JSON.stringify(body) : void 0
  });
  const text2 = await res.text();
  try {
    return { ok: res.ok, status: res.status, data: JSON.parse(text2) };
  } catch {
    return { ok: res.ok, status: res.status, data: { raw: text2 } };
  }
}
async function getInstanceName() {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(settings).limit(1);
  return rows[0]?.whatsappInstance || null;
}
async function saveInstanceName(instanceName) {
  const db = await getDb();
  if (!db) return;
  const rows = await db.select().from(settings).limit(1);
  if (rows.length > 0) {
    await db.update(settings).set({ whatsappInstance: instanceName }).where((0, import_drizzle_orm3.eq)(settings.id, rows[0].id));
  } else {
    await db.insert(settings).values({ whatsappInstance: instanceName });
  }
}
async function clearInstanceName() {
  const db = await getDb();
  if (!db) return;
  const rows = await db.select().from(settings).limit(1);
  if (rows.length > 0) {
    await db.update(settings).set({ whatsappInstance: null }).where((0, import_drizzle_orm3.eq)(settings.id, rows[0].id));
  }
}
var whatsappRouter = router({
  // جلب الـ instance المحفوظ وحالته
  getStatus: protectedProcedure.query(async () => {
    const instanceName = await getInstanceName();
    if (!instanceName) {
      return { status: "not_configured", instanceName: null, number: null };
    }
    try {
      const res = await evoFetch(`/instance/connectionState/${instanceName}`);
      const state = res.data?.instance?.state || res.data?.state || "disconnected";
      const number = res.data?.instance?.profileName || res.data?.profileName || null;
      if (state === "open") {
        return { status: "connected", instanceName, number };
      } else if (state === "connecting") {
        return { status: "pending", instanceName, number: null };
      } else {
        return { status: "disconnected", instanceName, number: null };
      }
    } catch {
      return { status: "disconnected", instanceName, number: null };
    }
  }),
  // إنشاء instance جديد وجلب QR
  createInstance: protectedProcedure.input(import_zod8.z.object({ number: import_zod8.z.string().min(9) })).mutation(async ({ input }) => {
    const oldInstance = await getInstanceName();
    if (oldInstance) {
      try {
        await evoFetch(`/instance/delete/${oldInstance}`, "DELETE");
      } catch {
      }
    }
    let num = input.number.replace(/[^0-9]/g, "");
    if (num.length === 10 && num.startsWith("0")) num = "966" + num.slice(1);
    else if (num.length === 9) num = "966" + num;
    const instanceName = `darin-${Date.now()}`;
    const res = await evoFetch("/instance/create", "POST", {
      instanceName,
      number: num,
      qrcode: true,
      integration: "WHATSAPP-BAILEYS"
    });
    if (!res.ok && res.status !== 201) {
      throw new Error(res.data?.message || "\u0641\u0634\u0644 \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u0627\u062A\u0635\u0627\u0644");
    }
    await saveInstanceName(instanceName);
    await new Promise((r) => setTimeout(r, 2e3));
    const qrRes = await evoFetch(`/instance/connect/${instanceName}`);
    const qrBase64 = qrRes.data?.base64 || qrRes.data?.qrcode?.base64 || null;
    return {
      instanceName,
      qrBase64,
      instance: res.data?.instance || res.data
    };
  }),
  // جلب QR code للـ instance الحالي
  getQR: protectedProcedure.query(async () => {
    const instanceName = await getInstanceName();
    if (!instanceName) throw new Error("\u0644\u0627 \u064A\u0648\u062C\u062F instance \u0645\u064F\u0646\u0634\u0623");
    const res = await evoFetch(`/instance/connect/${instanceName}`);
    const qrBase64 = res.data?.base64 || res.data?.qrcode?.base64 || null;
    return { qrBase64, instanceName };
  }),
  // التحقق من حالة الاتصال (للـ polling)
  checkConnection: protectedProcedure.query(async () => {
    const instanceName = await getInstanceName();
    if (!instanceName) return { state: "not_configured" };
    try {
      const res = await evoFetch(`/instance/connectionState/${instanceName}`);
      const state = res.data?.instance?.state || res.data?.state || "disconnected";
      const number = res.data?.instance?.profileName || null;
      return { state, instanceName, number };
    } catch {
      return { state: "disconnected", instanceName, number: null };
    }
  }),
  // قطع الاتصال وحذف الـ instance
  disconnect: protectedProcedure.mutation(async () => {
    const instanceName = await getInstanceName();
    if (instanceName) {
      try {
        await evoFetch(`/instance/delete/${instanceName}`, "DELETE");
      } catch {
      }
    }
    await clearInstanceName();
    return { success: true };
  }),
  // إرسال رسالة واتساب
  sendMessage: protectedProcedure.input(
    import_zod8.z.object({
      phone: import_zod8.z.string(),
      message: import_zod8.z.string()
    })
  ).mutation(async ({ input }) => {
    const instanceName = await getInstanceName();
    if (!instanceName) throw new Error("\u0648\u0627\u062A\u0633\u0627\u0628 \u063A\u064A\u0631 \u0645\u064F\u0641\u0639\u064E\u0651\u0644");
    let num = input.phone.replace(/[^0-9]/g, "");
    if (num.length === 10 && num.startsWith("0")) num = "966" + num.slice(1);
    else if (num.length === 9) num = "966" + num;
    const res = await evoFetch(`/message/sendText/${instanceName}`, "POST", {
      number: num,
      text: input.message
    });
    if (!res.ok) {
      throw new Error(res.data?.message || "\u0641\u0634\u0644 \u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0631\u0633\u0627\u0644\u0629");
    }
    return { success: true };
  })
});

// server/routers/payment.ts
var import_zod9 = require("zod");
init_db();
init_schema();
var import_drizzle_orm4 = require("drizzle-orm");
init_db();
var import_crypto = __toESM(require("crypto"), 1);
async function sendMFPayment(opts) {
  const { amount, customerName, customerPhone, token, origin, settings: settings2 } = opts;
  const axiosLib = (await import("axios")).default;
  const isLive = settings2.myfatoorahEnv === "live";
  const base = isLive ? "https://api.myfatoorah.com" : "https://apitest.myfatoorah.com";
  const callbackUrl = `${origin}/api/payment-callback?token=${token}`;
  const body = {
    NotificationOption: "LNK",
    InvoiceValue: amount,
    CustomerName: customerName || "\u0639\u0645\u064A\u0644",
    CustomerMobile: customerPhone || "",
    Language: "AR",
    CallBackUrl: callbackUrl,
    ErrorUrl: `${origin}/api/payment-callback?token=${token}&status=error`,
    DisplayCurrencyIso: "SAR",
    SupplierCode: parseInt(settings2.myfatoorahSupplier || "24"),
    InvoiceItems: [{ ItemName: "\u0637\u0644\u0628 \u062F\u0641\u0639", Quantity: 1, UnitPrice: amount }]
  };
  const res = await axiosLib.post(`${base}/v2/SendPayment`, body, {
    headers: {
      Authorization: `Bearer ${settings2.myfatoorahToken}`,
      "Content-Type": "application/json"
    },
    timeout: 15e3
  });
  const data = res.data?.Data;
  return {
    mfInvoiceId: String(data?.InvoiceId || ""),
    paymentUrl: data?.InvoiceURL || "",
    qrCode: data?.QrCodeUrl || ""
  };
}
async function sendWhatsAppMessage(phone, message, settings2) {
  if (!settings2?.whatsappInstance || !settings2?.whatsappApiBase) return false;
  try {
    const axiosLib = (await import("axios")).default;
    const base = settings2.whatsappApiBase.replace(/\/$/, "");
    const apiKey = settings2.whatsappApiKey || "";
    const formattedPhone = phone.replace(/\D/g, "").replace(/^0/, "966");
    await axiosLib.post(
      `${base}/message/sendText/${settings2.whatsappInstance}`,
      { number: `${formattedPhone}@s.whatsapp.net`, text: message },
      { headers: { apikey: apiKey }, timeout: 1e4 }
    );
    return true;
  } catch (e) {
    console.error("[WhatsApp] send error:", e?.message);
    return false;
  }
}
var paymentRouter = {
  /**
   * createPaymentRequest
   * Called from POS when cashier selects "electronic" payment.
   * Stores cart snapshot, calls MyFatoorah, returns QR + PaymentURL.
   * Does NOT create an invoice.
   */
  createPaymentRequest: protectedProcedure.input(
    import_zod9.z.object({
      // Cart totals
      subtotal: import_zod9.z.number(),
      discountAmount: import_zod9.z.number().default(0),
      discountType: import_zod9.z.string().optional(),
      discountValue: import_zod9.z.number().optional(),
      discountId: import_zod9.z.number().optional(),
      taxRate: import_zod9.z.number().default(0),
      taxAmount: import_zod9.z.number().default(0),
      total: import_zod9.z.number(),
      // Customer
      customerId: import_zod9.z.number().optional(),
      customerName: import_zod9.z.string().optional(),
      customerPhone: import_zod9.z.string().optional(),
      warehouseId: import_zod9.z.number().optional(),
      notes: import_zod9.z.string().optional(),
      // Cart items (JSON)
      cartJson: import_zod9.z.string(),
      // Origin for callback URL
      origin: import_zod9.z.string()
    })
  ).mutation(async ({ input, ctx }) => {
    const settings2 = await getSettings();
    if (!settings2?.myfatoorahToken) {
      throw new Error("MyFatoorah \u063A\u064A\u0631 \u0645\u0641\u0639\u0651\u0644 - \u064A\u0631\u062C\u0649 \u0625\u062F\u062E\u0627\u0644 \u0627\u0644\u0640 Token \u0641\u064A \u0627\u0644\u0625\u0639\u062F\u0627\u062F\u0627\u062A");
    }
    const db = await getDb();
    if (!db) throw new Error("DB connection failed");
    const token = import_crypto.default.randomBytes(24).toString("hex");
    const mfData = await sendMFPayment({
      amount: input.total,
      customerName: input.customerName || "\u0639\u0645\u064A\u0644",
      customerPhone: input.customerPhone || "",
      token,
      origin: input.origin,
      settings: settings2
    });
    await db.insert(paymentRequests).values({
      token,
      cartJson: input.cartJson,
      customerId: input.customerId,
      customerName: input.customerName,
      customerPhone: input.customerPhone,
      warehouseId: input.warehouseId,
      cashierId: ctx.user.id,
      subtotal: String(input.subtotal),
      discountAmount: String(input.discountAmount),
      discountType: input.discountType,
      discountValue: String(input.discountValue || 0),
      discountId: input.discountId,
      taxRate: String(input.taxRate),
      taxAmount: String(input.taxAmount),
      total: String(input.total),
      notes: input.notes,
      mfInvoiceId: mfData.mfInvoiceId,
      mfPaymentUrl: mfData.paymentUrl,
      mfQrCode: mfData.qrCode,
      mfStatus: "pending",
      status: "pending"
    });
    if (input.customerPhone && settings2.whatsappInstance) {
      const msg = `\u0645\u0631\u062D\u0628\u0627\u064B ${input.customerName || ""}\u060C

\u064A\u0631\u062C\u0649 \u0625\u062A\u0645\u0627\u0645 \u0627\u0644\u062F\u0641\u0639 \u0639\u0628\u0631 \u0627\u0644\u0631\u0627\u0628\u0637 \u0627\u0644\u062A\u0627\u0644\u064A:
${mfData.paymentUrl}

\u0627\u0644\u0645\u0628\u0644\u063A: ${input.total.toFixed(2)} \u0631.\u0633`;
      await sendWhatsAppMessage(input.customerPhone, msg, settings2);
    }
    return {
      token,
      paymentUrl: mfData.paymentUrl,
      qrCode: mfData.qrCode
    };
  }),
  /**
   * checkPaymentRequest
   * Polling from POS every 5 seconds to check if customer paid.
   */
  checkPaymentRequest: protectedProcedure.input(import_zod9.z.object({ token: import_zod9.z.string() })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return { status: "pending", invoiceId: null };
    const rows = await db.select().from(paymentRequests).where((0, import_drizzle_orm4.eq)(paymentRequests.token, input.token)).limit(1);
    const req = rows[0];
    if (!req) return { status: "not_found", invoiceId: null };
    return {
      status: req.status,
      invoiceId: req.invoiceId,
      mfStatus: req.mfStatus
    };
  })
};

// server/routers.ts
var appRouter = router({
  system: systemRouter,
  auth: authRouter,
  settings: settingsRouter,
  products: productsRouter,
  customers: customersRouter,
  invoices: invoicesRouter,
  users: usersRouter,
  whatsapp: whatsappRouter,
  payment: paymentRouter
});

// server/_core/context.ts
var import_jose2 = require("jose");
var import_cookie = require("cookie");
function getSessionSecret2() {
  const secret = process.env.JWT_SECRET || "darin-madani-secret-key-2024";
  return new TextEncoder().encode(secret);
}
async function createContext(opts) {
  let user = null;
  try {
    const cookieHeader = opts.req.headers.cookie;
    const cookies = cookieHeader ? (0, import_cookie.parse)(cookieHeader) : {};
    const token = cookies[COOKIE_NAME];
    if (token) {
      const secretKey = getSessionSecret2();
      const { payload } = await (0, import_jose2.jwtVerify)(token, secretKey, { algorithms: ["HS256"] });
      const userId = payload.userId;
      if (userId) {
        const { getUserById: getUserById2 } = await Promise.resolve().then(() => (init_db(), db_exports));
        user = await getUserById2(userId) ?? null;
      }
    }
  } catch {
    user = null;
  }
  return {
    req: opts.req,
    res: opts.res,
    user
  };
}

// server/storage.ts
init_env();
function getForgeConfig() {
  const forgeUrl = ENV.forgeApiUrl;
  const forgeKey = ENV.forgeApiKey;
  if (!forgeUrl || !forgeKey) {
    throw new Error(
      "Storage config missing: set BUILT_IN_FORGE_API_URL and BUILT_IN_FORGE_API_KEY"
    );
  }
  return { forgeUrl: forgeUrl.replace(/\/+$/, ""), forgeKey };
}
function normalizeKey(relKey) {
  return relKey.replace(/^\/+/, "");
}
function appendHashSuffix(relKey) {
  const hash = crypto.randomUUID().replace(/-/g, "").slice(0, 8);
  const lastDot = relKey.lastIndexOf(".");
  if (lastDot === -1) return `${relKey}_${hash}`;
  return `${relKey.slice(0, lastDot)}_${hash}${relKey.slice(lastDot)}`;
}
async function storagePut(relKey, data, contentType = "application/octet-stream") {
  const { forgeUrl, forgeKey } = getForgeConfig();
  const key = appendHashSuffix(normalizeKey(relKey));
  const presignUrl = new URL("v1/storage/presign/put", forgeUrl + "/");
  presignUrl.searchParams.set("path", key);
  const presignResp = await fetch(presignUrl, {
    headers: { Authorization: `Bearer ${forgeKey}` }
  });
  if (!presignResp.ok) {
    const msg = await presignResp.text().catch(() => presignResp.statusText);
    throw new Error(`Storage presign failed (${presignResp.status}): ${msg}`);
  }
  const { url: s3Url } = await presignResp.json();
  if (!s3Url) throw new Error("Forge returned empty presign URL");
  const blob = typeof data === "string" ? new Blob([data], { type: contentType }) : new Blob([data], { type: contentType });
  const uploadResp = await fetch(s3Url, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: blob
  });
  if (!uploadResp.ok) {
    throw new Error(`Storage upload to S3 failed (${uploadResp.status})`);
  }
  return { key, url: `/manus-storage/${key}` };
}

// server/_core/index.prod.ts
var import_fs = __toESM(require("fs"), 1);
var import_bcryptjs3 = __toESM(require("bcryptjs"), 1);
init_db();
init_schema();
var import_drizzle_orm5 = require("drizzle-orm");
import_dotenv.default.config({ path: import_path.default.resolve(__dirname, "..", ".env") });
import_dotenv.default.config({ path: import_path.default.resolve(__dirname, ".env") });
import_dotenv.default.config();
function serveStatic(app) {
  const distPath = import_path.default.resolve(__dirname, "public");
  if (!import_fs.default.existsSync(distPath)) {
    console.error(`Could not find build directory: ${distPath}`);
  } else {
    console.log(`Serving static files from: ${distPath}`);
  }
  app.use(import_express.default.static(distPath));
  app.use("*", (_req, res) => {
    const indexPath = import_path.default.resolve(distPath, "index.html");
    if (import_fs.default.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).send("App not built. index.html not found at: " + indexPath);
    }
  });
}
async function main() {
  const app = (0, import_express.default)();
  const server = (0, import_http.createServer)(app);
  app.use(import_express.default.json({ limit: "50mb" }));
  app.use(import_express.default.urlencoded({ extended: true, limit: "50mb" }));
  const upload = (0, import_multer.default)({ storage: import_multer.default.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });
  registerStorageProxy(app);
  app.post("/api/upload", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ error: "No file uploaded" });
      const ext = req.file.originalname.split(".").pop() || "bin";
      const key = `uploads/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { url } = await storagePut(key, req.file.buffer, req.file.mimetype);
      res.json({ url, key });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
  app.get("/api/debug-env", (_req, res) => {
    res.json({
      cwd: process.cwd(),
      dirname: __dirname,
      DATABASE_URL: process.env.DATABASE_URL ? "SET (length=" + process.env.DATABASE_URL.length + ")" : "NOT SET",
      JWT_SECRET: process.env.JWT_SECRET ? "SET" : "NOT SET",
      NODE_ENV: process.env.NODE_ENV,
      envPaths: [
        import_path.default.resolve(__dirname, "..", ".env"),
        import_path.default.resolve(__dirname, ".env")
      ].map((p) => ({ path: p, exists: import_fs.default.existsSync(p) }))
    });
  });
  app.get("/api/setup-admin", async (req, res) => {
    try {
      const db = await getDb();
      if (!db) {
        res.status(200).json({
          error: "Database not available",
          env: !!process.env.DATABASE_URL,
          DATABASE_URL_preview: process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 30) + "..." : "NOT SET",
          cwd: process.cwd(),
          dirname: __dirname
        });
        return;
      }
      const existing = await db.select().from(users).where((0, import_drizzle_orm5.eq)(users.username, "admin")).limit(1);
      if (existing.length > 0) {
        res.status(200).json({ message: "Admin already exists", username: existing[0].username });
        return;
      }
      const passwordHash = await import_bcryptjs3.default.hash("admin123", 12);
      await db.insert(users).values({
        openId: `local-admin-${Date.now()}`,
        username: "admin",
        name: "\u0645\u062F\u064A\u0631 \u0627\u0644\u0646\u0638\u0627\u0645",
        nameEn: "System Admin",
        passwordHash,
        role: "admin",
        loginMethod: "local",
        isActive: true
      });
      res.status(200).json({ success: true, message: "Admin user created", username: "admin", password: "admin123" });
    } catch (e) {
      res.status(200).json({ error: String(e.message), code: e.code, stack: String(e.stack).split("\n").slice(0, 8) });
    }
  });
  app.use(
    "/api/trpc",
    (0, import_express2.createExpressMiddleware)({
      router: appRouter,
      createContext
    })
  );
  serveStatic(app);
  const listenTarget = process.env.PORT || 3e3;
  server.listen(listenTarget, () => {
    console.log(`Server running on: ${listenTarget}`);
  });
}
main().catch(console.error);
