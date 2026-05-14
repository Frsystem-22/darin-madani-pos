var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

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
var schema_exports = {};
__export(schema_exports, {
  categories: () => categories,
  customers: () => customers,
  discounts: () => discounts,
  invoiceItems: () => invoiceItems,
  invoicePayments: () => invoicePayments,
  invoices: () => invoices,
  paymentRequests: () => paymentRequests,
  productStock: () => productStock,
  products: () => products,
  returnItems: () => returnItems,
  returns: () => returns,
  settings: () => settings,
  stockMovements: () => stockMovements,
  userPermissions: () => userPermissions,
  users: () => users,
  warehouses: () => warehouses
});
import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  decimal,
  boolean,
  json
} from "drizzle-orm/mysql-core";
var users, userPermissions, settings, warehouses, categories, products, productStock, stockMovements, customers, discounts, invoices, invoiceItems, returns, returnItems, invoicePayments, paymentRequests;
var init_schema = __esm({
  "drizzle/schema.ts"() {
    "use strict";
    users = mysqlTable("users", {
      id: int("id").autoincrement().primaryKey(),
      openId: varchar("openId", { length: 64 }).notNull().unique(),
      username: varchar("username", { length: 64 }).unique(),
      name: text("name"),
      nameEn: varchar("nameEn", { length: 255 }),
      email: varchar("email", { length: 320 }),
      phone: varchar("phone", { length: 32 }),
      passwordHash: varchar("passwordHash", { length: 255 }),
      loginMethod: varchar("loginMethod", { length: 64 }),
      role: mysqlEnum("role", ["admin", "manager", "cashier", "warehouse"]).default("cashier").notNull(),
      isActive: boolean("isActive").default(true).notNull(),
      language: mysqlEnum("language", ["ar", "en"]).default("ar").notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
      lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull()
    });
    userPermissions = mysqlTable("user_permissions", {
      id: int("id").autoincrement().primaryKey(),
      userId: int("userId").notNull(),
      module: varchar("module", { length: 64 }).notNull(),
      // e.g. "pos", "inventory"
      action: varchar("action", { length: 64 }).notNull(),
      // e.g. "view", "create", "edit", "delete"
      allowed: boolean("allowed").default(false).notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
    settings = mysqlTable("settings", {
      id: int("id").autoincrement().primaryKey(),
      storeName: varchar("storeName", { length: 255 }).default("Darin Madani Fashion House"),
      storeNameEn: varchar("storeNameEn", { length: 255 }).default("Darin Madani Fashion House"),
      storePhone: varchar("storePhone", { length: 32 }),
      storeEmail: varchar("storeEmail", { length: 255 }),
      storeAddress: text("storeAddress"),
      storeAddressEn: text("storeAddressEn"),
      storeLogo: text("storeLogo"),
      taxNumber: varchar("taxNumber", { length: 64 }),
      taxRate: decimal("taxRate", { precision: 5, scale: 2 }).default("15.00"),
      currency: varchar("currency", { length: 8 }).default("SAR"),
      currencySymbol: varchar("currencySymbol", { length: 8 }).default("\u0631.\u0633"),
      invoiceNote: text("invoiceNote"),
      invoiceNoteEn: text("invoiceNoteEn"),
      // WhatsApp (Evolution API)
      whatsappEnabled: boolean("whatsappEnabled").default(false),
      whatsappInstance: varchar("whatsappInstance", { length: 128 }),
      whatsappApiKey: varchar("whatsappApiKey", { length: 255 }),
      whatsappApiBase: varchar("whatsappApiBase", { length: 255 }).default("https://elv.academy-smart.com"),
      whatsappTemplate: text("whatsappTemplate"),
      // MyFatoorah
      myfatoorahEnabled: boolean("myfatoorahEnabled").default(false),
      myfatoorahToken: text("myfatoorahToken"),
      myfatoorahEnv: mysqlEnum("myfatoorahEnv", ["sandbox", "live"]).default("sandbox"),
      myfatoorahSupplier: varchar("myfatoorahSupplier", { length: 64 }),
      priceIncludesTax: boolean("priceIncludesTax").default(false),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    warehouses = mysqlTable("warehouses", {
      id: int("id").autoincrement().primaryKey(),
      name: varchar("name", { length: 255 }).notNull(),
      nameEn: varchar("nameEn", { length: 255 }),
      description: text("description"),
      isDefault: boolean("isDefault").default(false).notNull(),
      isActive: boolean("isActive").default(true).notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    categories = mysqlTable("categories", {
      id: int("id").autoincrement().primaryKey(),
      name: varchar("name", { length: 255 }).notNull(),
      nameEn: varchar("nameEn", { length: 255 }),
      parentId: int("parentId"),
      sortOrder: int("sortOrder").default(0),
      isActive: boolean("isActive").default(true).notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
    products = mysqlTable("products", {
      id: int("id").autoincrement().primaryKey(),
      sku: varchar("sku", { length: 64 }).unique(),
      barcode: varchar("barcode", { length: 64 }).unique(),
      name: varchar("name", { length: 255 }).notNull(),
      nameEn: varchar("nameEn", { length: 255 }),
      description: text("description"),
      descriptionEn: text("descriptionEn"),
      categoryId: int("categoryId"),
      color: varchar("color", { length: 64 }),
      colorEn: varchar("colorEn", { length: 64 }),
      colorHex: varchar("colorHex", { length: 16 }),
      size: varchar("size", { length: 32 }),
      costPrice: decimal("costPrice", { precision: 10, scale: 2 }).default("0.00"),
      salePrice: decimal("salePrice", { precision: 10, scale: 2 }).notNull(),
      images: json("images").$type().default([]),
      isActive: boolean("isActive").default(true).notNull(),
      lowStockAlert: int("lowStockAlert").default(5),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    productStock = mysqlTable("product_stock", {
      id: int("id").autoincrement().primaryKey(),
      productId: int("productId").notNull(),
      warehouseId: int("warehouseId").notNull(),
      qty: int("qty").default(0).notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    stockMovements = mysqlTable("stock_movements", {
      id: int("id").autoincrement().primaryKey(),
      productId: int("productId").notNull(),
      warehouseId: int("warehouseId").notNull(),
      toWarehouseId: int("toWarehouseId"),
      type: mysqlEnum("type", ["purchase", "sale", "return", "transfer", "adjustment"]).notNull(),
      qty: int("qty").notNull(),
      costPrice: decimal("costPrice", { precision: 10, scale: 2 }),
      reference: varchar("reference", { length: 128 }),
      notes: text("notes"),
      userId: int("userId"),
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
    customers = mysqlTable("customers", {
      id: int("id").autoincrement().primaryKey(),
      name: varchar("name", { length: 255 }).notNull(),
      phone: varchar("phone", { length: 32 }).unique(),
      email: varchar("email", { length: 320 }),
      city: varchar("city", { length: 128 }),
      address: text("address"),
      notes: text("notes"),
      points: int("points").default(0),
      totalSpent: decimal("totalSpent", { precision: 12, scale: 2 }).default("0.00"),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    discounts = mysqlTable("discounts", {
      id: int("id").autoincrement().primaryKey(),
      name: varchar("name", { length: 255 }).notNull(),
      nameEn: varchar("nameEn", { length: 255 }),
      type: mysqlEnum("type", ["percentage", "fixed"]).notNull(),
      value: decimal("value", { precision: 10, scale: 2 }).notNull(),
      minAmount: decimal("minAmount", { precision: 10, scale: 2 }).default("0.00"),
      maxUses: int("maxUses"),
      usedCount: int("usedCount").default(0),
      isActive: boolean("isActive").default(true).notNull(),
      startDate: timestamp("startDate"),
      endDate: timestamp("endDate"),
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
    invoices = mysqlTable("invoices", {
      id: int("id").autoincrement().primaryKey(),
      invoiceNumber: varchar("invoiceNumber", { length: 32 }).notNull().unique(),
      customerId: int("customerId"),
      customerName: varchar("customerName", { length: 255 }),
      customerPhone: varchar("customerPhone", { length: 32 }),
      warehouseId: int("warehouseId"),
      subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull(),
      discountType: mysqlEnum("discountType", ["percentage", "fixed", "none"]).default("none"),
      discountValue: decimal("discountValue", { precision: 10, scale: 2 }).default("0.00"),
      discountAmount: decimal("discountAmount", { precision: 10, scale: 2 }).default("0.00"),
      discountId: int("discountId"),
      taxRate: decimal("taxRate", { precision: 5, scale: 2 }).default("0.00"),
      taxAmount: decimal("taxAmount", { precision: 10, scale: 2 }).default("0.00"),
      total: decimal("total", { precision: 12, scale: 2 }).notNull(),
      paymentMethod: mysqlEnum("paymentMethod", ["cash", "card", "transfer", "electronic", "mixed"]).default("cash"),
      paymentStatus: mysqlEnum("paymentStatus", ["paid", "pending", "partial", "refunded"]).default("paid"),
      status: mysqlEnum("status", ["completed", "cancelled", "returned"]).default("completed"),
      notes: text("notes"),
      token: varchar("token", { length: 64 }).unique(),
      // MyFatoorah
      mfInvoiceId: varchar("mfInvoiceId", { length: 128 }),
      mfPaymentUrl: text("mfPaymentUrl"),
      mfQrCode: text("mfQrCode"),
      mfStatus: varchar("mfStatus", { length: 32 }),
      // WhatsApp
      whatsappSent: boolean("whatsappSent").default(false),
      whatsappSentAt: timestamp("whatsappSentAt"),
      cashierId: int("cashierId"),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    invoiceItems = mysqlTable("invoice_items", {
      id: int("id").autoincrement().primaryKey(),
      invoiceId: int("invoiceId").notNull(),
      productId: int("productId"),
      productName: varchar("productName", { length: 255 }).notNull(),
      productNameEn: varchar("productNameEn", { length: 255 }),
      barcode: varchar("barcode", { length: 64 }),
      color: varchar("color", { length: 64 }),
      size: varchar("size", { length: 32 }),
      qty: int("qty").notNull(),
      unitPrice: decimal("unitPrice", { precision: 10, scale: 2 }).notNull(),
      discountPct: decimal("discountPct", { precision: 5, scale: 2 }).default("0.00"),
      lineTotal: decimal("lineTotal", { precision: 12, scale: 2 }).notNull()
    });
    returns = mysqlTable("returns", {
      id: int("id").autoincrement().primaryKey(),
      returnNumber: varchar("returnNumber", { length: 32 }).notNull().unique(),
      invoiceId: int("invoiceId").notNull(),
      invoiceNumber: varchar("invoiceNumber", { length: 32 }),
      customerId: int("customerId"),
      customerName: varchar("customerName", { length: 255 }),
      warehouseId: int("warehouseId"),
      refundAmount: decimal("refundAmount", { precision: 12, scale: 2 }).notNull(),
      refundMethod: mysqlEnum("refundMethod", ["cash", "card", "transfer", "credit"]).default("cash"),
      reason: text("reason"),
      status: mysqlEnum("status", ["completed", "pending"]).default("completed"),
      processedBy: int("processedBy"),
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
    returnItems = mysqlTable("return_items", {
      id: int("id").autoincrement().primaryKey(),
      returnId: int("returnId").notNull(),
      productId: int("productId"),
      productName: varchar("productName", { length: 255 }).notNull(),
      barcode: varchar("barcode", { length: 64 }),
      color: varchar("color", { length: 64 }),
      size: varchar("size", { length: 32 }),
      qty: int("qty").notNull(),
      unitPrice: decimal("unitPrice", { precision: 10, scale: 2 }).notNull(),
      lineTotal: decimal("lineTotal", { precision: 12, scale: 2 }).notNull()
    });
    invoicePayments = mysqlTable("invoice_payments", {
      id: int("id").autoincrement().primaryKey(),
      invoiceId: int("invoiceId").notNull(),
      method: mysqlEnum("method", ["cash", "card", "transfer", "electronic"]).notNull().default("cash"),
      amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
      reference: varchar("reference", { length: 128 }),
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
    paymentRequests = mysqlTable("payment_requests", {
      id: int("id").autoincrement().primaryKey(),
      token: varchar("token", { length: 64 }).notNull().unique(),
      // Cart snapshot (JSON)
      cartJson: text("cartJson").notNull(),
      customerId: int("customerId"),
      customerName: varchar("customerName", { length: 255 }),
      customerPhone: varchar("customerPhone", { length: 32 }),
      warehouseId: int("warehouseId"),
      cashierId: int("cashierId"),
      subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull(),
      discountAmount: decimal("discountAmount", { precision: 10, scale: 2 }).default("0.00"),
      taxRate: decimal("taxRate", { precision: 5, scale: 2 }).default("0.00"),
      taxAmount: decimal("taxAmount", { precision: 10, scale: 2 }).default("0.00"),
      total: decimal("total", { precision: 12, scale: 2 }).notNull(),
      discountType: varchar("discountType", { length: 32 }),
      discountValue: decimal("discountValue", { precision: 10, scale: 2 }).default("0.00"),
      discountId: int("discountId"),
      notes: text("notes"),
      // MyFatoorah
      mfInvoiceId: varchar("mfInvoiceId", { length: 128 }),
      mfPaymentUrl: text("mfPaymentUrl"),
      mfQrCode: text("mfQrCode"),
      mfStatus: varchar("mfStatus", { length: 32 }).default("pending"),
      // After payment
      invoiceId: int("invoiceId"),
      // set after invoice is created
      status: mysqlEnum("status", ["pending", "paid", "failed", "expired"]).default("pending"),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
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
  getLowStockProducts: () => getLowStockProducts,
  getMonthlySales: () => getMonthlySales,
  getProductByBarcode: () => getProductByBarcode,
  getProductById: () => getProductById,
  getProductStock: () => getProductStock,
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
import { and, desc, eq, gte, like, lte, or, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
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
  const r = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return r[0];
}
async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).orderBy(desc(users.createdAt));
}
async function getUserById(id) {
  const db = await getDb();
  if (!db) return void 0;
  const r = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return r[0];
}
async function getUserByUsername(username) {
  const db = await getDb();
  if (!db) return void 0;
  const r = await db.select().from(users).where(eq(users.username, username)).limit(1);
  return r[0];
}
async function updateUser(id, data) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set(data).where(eq(users.id, id));
}
async function deleteUser(id) {
  const db = await getDb();
  if (!db) return;
  await db.delete(users).where(eq(users.id, id));
}
async function getUserPermissions(userId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(userPermissions).where(eq(userPermissions.userId, userId));
}
async function setUserPermissions(userId, perms) {
  const db = await getDb();
  if (!db) return;
  await db.delete(userPermissions).where(eq(userPermissions.userId, userId));
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
    await db.update(settings).set(data).where(eq(settings.id, existing.id));
  } else {
    await db.insert(settings).values({ ...data });
  }
}
async function getWarehouses(activeOnly = true) {
  const db = await getDb();
  if (!db) return [];
  if (activeOnly) return db.select().from(warehouses).where(eq(warehouses.isActive, true));
  return db.select().from(warehouses);
}
async function getWarehouseById(id) {
  const db = await getDb();
  if (!db) return void 0;
  const r = await db.select().from(warehouses).where(eq(warehouses.id, id)).limit(1);
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
  await db.update(warehouses).set(data).where(eq(warehouses.id, id));
}
async function deleteWarehouse(id) {
  const db = await getDb();
  if (!db) return;
  await db.delete(warehouses).where(eq(warehouses.id, id));
}
async function getCategories() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(categories).where(eq(categories.isActive, true)).orderBy(categories.sortOrder);
}
async function createCategory(data) {
  const db = await getDb();
  if (!db) return;
  await db.insert(categories).values(data);
}
async function updateCategory(id, data) {
  const db = await getDb();
  if (!db) return;
  await db.update(categories).set(data).where(eq(categories.id, id));
}
async function deleteCategory(id) {
  const db = await getDb();
  if (!db) return;
  await db.delete(categories).where(eq(categories.id, id));
}
async function getProducts(filters) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [eq(products.isActive, true)];
  if (filters?.search) {
    const s = `%${filters.search}%`;
    conditions.push(or(like(products.name, s), like(products.nameEn, s), like(products.barcode, s), like(products.sku, s)));
  }
  if (filters?.categoryId) conditions.push(eq(products.categoryId, filters.categoryId));
  const rows = await db.select().from(products).where(and(...conditions)).orderBy(desc(products.createdAt));
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
  const r = await db.select().from(products).where(eq(products.id, id)).limit(1);
  if (!r[0]) return void 0;
  const stock = await db.select().from(productStock).where(eq(productStock.productId, id));
  return { ...r[0], stock, totalQty: stock.reduce((a, b) => a + b.qty, 0) };
}
async function getProductByBarcode(barcode) {
  const db = await getDb();
  if (!db) return void 0;
  const r = await db.select().from(products).where(eq(products.barcode, barcode)).limit(1);
  if (!r[0]) return void 0;
  const stock = await db.select().from(productStock).where(eq(productStock.productId, r[0].id));
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
  await db.update(products).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where(eq(products.id, id));
}
async function deleteProduct(id) {
  const db = await getDb();
  if (!db) return;
  await db.update(products).set({ isActive: false }).where(eq(products.id, id));
}
async function getProductStock(productId, warehouseId) {
  const db = await getDb();
  if (!db) return [];
  const conds = [eq(productStock.productId, productId)];
  if (warehouseId) conds.push(eq(productStock.warehouseId, warehouseId));
  return db.select().from(productStock).where(and(...conds));
}
async function upsertProductStock(productId, warehouseId, qty) {
  const db = await getDb();
  if (!db) return;
  await db.insert(productStock).values({ productId, warehouseId, qty }).onDuplicateKeyUpdate({ set: { qty: sql`qty + ${qty}` } });
}
async function setProductStock(productId, warehouseId, qty) {
  const db = await getDb();
  if (!db) return;
  const existing = await db.select().from(productStock).where(and(eq(productStock.productId, productId), eq(productStock.warehouseId, warehouseId))).limit(1);
  if (existing[0]) {
    await db.update(productStock).set({ qty }).where(eq(productStock.id, existing[0].id));
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
  if (productId) conds.push(eq(stockMovements.productId, productId));
  if (warehouseId) conds.push(eq(stockMovements.warehouseId, warehouseId));
  return db.select().from(stockMovements).where(conds.length ? and(...conds) : void 0).orderBy(desc(stockMovements.createdAt)).limit(100);
}
async function getCustomers(search) {
  const db = await getDb();
  if (!db) return [];
  if (search) {
    const s = `%${search}%`;
    return db.select().from(customers).where(or(like(customers.name, s), like(customers.phone, s), like(customers.email, s))).orderBy(desc(customers.createdAt));
  }
  return db.select().from(customers).orderBy(desc(customers.createdAt));
}
async function getCustomerById(id) {
  const db = await getDb();
  if (!db) return void 0;
  const r = await db.select().from(customers).where(eq(customers.id, id)).limit(1);
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
  await db.update(customers).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where(eq(customers.id, id));
}
async function deleteCustomer(id) {
  const db = await getDb();
  if (!db) return;
  await db.delete(customers).where(eq(customers.id, id));
}
async function getDiscounts(activeOnly = false) {
  const db = await getDb();
  if (!db) return [];
  if (activeOnly) return db.select().from(discounts).where(eq(discounts.isActive, true));
  return db.select().from(discounts).orderBy(desc(discounts.createdAt));
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
  await db.update(discounts).set(data).where(eq(discounts.id, id));
}
async function deleteDiscount(id) {
  const db = await getDb();
  if (!db) return;
  await db.delete(discounts).where(eq(discounts.id, id));
}
async function getInvoices(filters) {
  const db = await getDb();
  if (!db) return [];
  const conds = [];
  if (filters?.search) {
    const s = `%${filters.search}%`;
    conds.push(or(like(invoices.invoiceNumber, s), like(invoices.customerName, s), like(invoices.customerPhone, s)));
  }
  if (filters?.status) conds.push(eq(invoices.status, filters.status));
  if (filters?.from) conds.push(gte(invoices.createdAt, filters.from));
  if (filters?.to) conds.push(lte(invoices.createdAt, filters.to));
  if (filters?.customerId) conds.push(eq(invoices.customerId, filters.customerId));
  const rows = await db.select().from(invoices).where(conds.length ? and(...conds) : void 0).orderBy(desc(invoices.createdAt));
  return rows;
}
async function getInvoiceById(id) {
  const db = await getDb();
  if (!db) return void 0;
  const r = await db.select().from(invoices).where(eq(invoices.id, id)).limit(1);
  if (!r[0]) return void 0;
  const items = await db.select().from(invoiceItems).where(eq(invoiceItems.invoiceId, id));
  const settingsRows = await db.select().from(settings).limit(1);
  return { ...r[0], items, settings: settingsRows[0] || null };
}
async function getInvoiceByToken(token) {
  const db = await getDb();
  if (!db) return void 0;
  const r = await db.select().from(invoices).where(eq(invoices.token, token)).limit(1);
  if (!r[0]) return void 0;
  const items = await db.select().from(invoiceItems).where(eq(invoiceItems.invoiceId, r[0].id));
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
  await db.update(invoices).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where(eq(invoices.id, id));
}
async function generateInvoiceNumber() {
  const db = await getDb();
  if (!db) return `INV-${Date.now()}`;
  const today = /* @__PURE__ */ new Date();
  const prefix = `INV-${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}`;
  const r = await db.select({ num: invoices.invoiceNumber }).from(invoices).where(like(invoices.invoiceNumber, `${prefix}%`)).orderBy(desc(invoices.invoiceNumber)).limit(1);
  const last = r[0]?.num;
  const seq = last ? parseInt(last.split("-").pop() || "0") + 1 : 1;
  return `${prefix}-${String(seq).padStart(4, "0")}`;
}
async function getReturns(search) {
  const db = await getDb();
  if (!db) return [];
  if (search) {
    const s = `%${search}%`;
    return db.select().from(returns).where(or(like(returns.returnNumber, s), like(returns.invoiceNumber, s), like(returns.customerName, s))).orderBy(desc(returns.createdAt));
  }
  return db.select().from(returns).orderBy(desc(returns.createdAt));
}
async function getReturnById(id) {
  const db = await getDb();
  if (!db) return void 0;
  const r = await db.select().from(returns).where(eq(returns.id, id)).limit(1);
  if (!r[0]) return void 0;
  const items = await db.select().from(returnItems).where(eq(returnItems.returnId, id));
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
  const r = await db.select({ num: returns.returnNumber }).from(returns).where(like(returns.returnNumber, `${prefix}%`)).orderBy(desc(returns.returnNumber)).limit(1);
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
  const todayRows = await db.execute(sql`SELECT COUNT(*) as cnt, COALESCE(SUM(total),0) as total FROM invoices WHERE status='completed' AND createdAt >= ${todayStart}`);
  const monthRows = await db.execute(sql`SELECT COUNT(*) as cnt, COALESCE(SUM(total),0) as total FROM invoices WHERE status='completed' AND createdAt >= ${monthStart}`);
  const custRows = await db.execute(sql`SELECT COUNT(*) as cnt FROM customers`);
  const lowRows = await db.execute(sql`SELECT COUNT(*) as cnt FROM products p WHERE p.isActive=1 AND (SELECT COALESCE(SUM(qty),0) FROM product_stock WHERE productId=p.id) <= p.lowStockAlert`);
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
  const result = await db.execute(sql`
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
  const result = await db.execute(sql`
    SELECT DATE_FORMAT(createdAt, '%Y-%m') as month, COUNT(*) as orders, COALESCE(SUM(total),0) as total
    FROM invoices WHERE status='completed'
    GROUP BY month ORDER BY month DESC LIMIT ${months}
  `);
  return (result[0] || []).reverse();
}
async function getLowStockProducts() {
  const db = await getDb();
  if (!db) return [];
  const result = await db.execute(sql`
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
  const token = __require("crypto").randomBytes(16).toString("hex");
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
var _db;
var init_db = __esm({
  "server/db.ts"() {
    "use strict";
    init_schema();
    init_env();
    _db = null;
  }
});

// server/_core/index.ts
import "dotenv/config";
import express2 from "express";
import { createServer } from "http";
import net from "net";
import multer from "multer";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

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
import { z } from "zod";

// server/_core/notification.ts
init_env();
import { TRPCError } from "@trpc/server";
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
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification title is required."
    });
  }
  if (!isNonEmptyString(input.content)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification content is required."
    });
  }
  const title = trimValue(input.title);
  const content = trimValue(input.content);
  if (title.length > TITLE_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification title must be at most ${TITLE_MAX_LENGTH} characters.`
    });
  }
  if (content.length > CONTENT_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification content must be at most ${CONTENT_MAX_LENGTH} characters.`
    });
  }
  return { title, content };
};
async function notifyOwner(payload) {
  const { title, content } = validatePayload(payload);
  if (!ENV.forgeApiUrl) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service URL is not configured."
    });
  }
  if (!ENV.forgeApiKey) {
    throw new TRPCError({
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
import { initTRPC, TRPCError as TRPCError2 } from "@trpc/server";
import superjson from "superjson";
var t = initTRPC.context().create({
  transformer: superjson
});
var router = t.router;
var publicProcedure = t.procedure;
var requireUser = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new TRPCError2({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
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
      throw new TRPCError2({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
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
    z.object({
      timestamp: z.number().min(0, "timestamp cannot be negative")
    })
  ).query(() => ({
    ok: true
  })),
  notifyOwner: adminProcedure.input(
    z.object({
      title: z.string().min(1, "title is required"),
      content: z.string().min(1, "content is required")
    })
  ).mutation(async ({ input }) => {
    const delivered = await notifyOwner(input);
    return {
      success: delivered
    };
  })
});

// server/routers/auth.ts
import { TRPCError as TRPCError3 } from "@trpc/server";
import { z as z2 } from "zod";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
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
  return new SignJWT({ userId }).setProtectedHeader({ alg: "HS256", typ: "JWT" }).setExpirationTime(expiresAt).sign(secretKey);
}
var authRouter = router({
  me: publicProcedure.query(({ ctx }) => ctx.user ?? null),
  login: publicProcedure.input(z2.object({
    username: z2.string().min(1),
    password: z2.string().min(1)
  })).mutation(async ({ input, ctx }) => {
    const user = await getUserByUsername(input.username);
    if (!user) {
      throw new TRPCError3({ code: "UNAUTHORIZED", message: "\u0627\u0633\u0645 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u0623\u0648 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u063A\u064A\u0631 \u0635\u062D\u064A\u062D\u0629" });
    }
    if (!user.isActive) {
      throw new TRPCError3({ code: "FORBIDDEN", message: "\u0627\u0644\u062D\u0633\u0627\u0628 \u0645\u0648\u0642\u0648\u0641. \u062A\u0648\u0627\u0635\u0644 \u0645\u0639 \u0627\u0644\u0645\u062F\u064A\u0631" });
    }
    if (!user.passwordHash) {
      throw new TRPCError3({ code: "UNAUTHORIZED", message: "\u0644\u0645 \u064A\u062A\u0645 \u062A\u0639\u064A\u064A\u0646 \u0643\u0644\u0645\u0629 \u0645\u0631\u0648\u0631 \u0644\u0647\u0630\u0627 \u0627\u0644\u062D\u0633\u0627\u0628" });
    }
    const valid = await bcrypt.compare(input.password, user.passwordHash);
    if (!valid) {
      throw new TRPCError3({ code: "UNAUTHORIZED", message: "\u0627\u0633\u0645 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u0623\u0648 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u063A\u064A\u0631 \u0635\u062D\u064A\u062D\u0629" });
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
  changePassword: protectedProcedure.input(z2.object({
    currentPassword: z2.string().min(1),
    newPassword: z2.string().min(6)
  })).mutation(async ({ input, ctx }) => {
    const user = await getUserById(ctx.user.id);
    if (!user?.passwordHash) throw new TRPCError3({ code: "BAD_REQUEST" });
    const valid = await bcrypt.compare(input.currentPassword, user.passwordHash);
    if (!valid) throw new TRPCError3({ code: "UNAUTHORIZED", message: "\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0627\u0644\u062D\u0627\u0644\u064A\u0629 \u063A\u064A\u0631 \u0635\u062D\u064A\u062D\u0629" });
    const newHash = await bcrypt.hash(input.newPassword, 12);
    await updateUser(ctx.user.id, { passwordHash: newHash });
    return { success: true };
  })
});

// server/routers/settings.ts
init_db();
import { z as z3 } from "zod";
import { TRPCError as TRPCError4 } from "@trpc/server";
var adminOnly = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin" && ctx.user.role !== "manager") throw new TRPCError4({ code: "FORBIDDEN" });
  return next({ ctx });
});
var settingsRouter = router({
  get: protectedProcedure.query(async () => {
    return await getSettings();
  }),
  update: adminOnly.input(z3.object({
    storeName: z3.string().optional(),
    storeNameEn: z3.string().optional(),
    storePhone: z3.string().optional(),
    storeEmail: z3.string().optional(),
    storeAddress: z3.string().optional(),
    storeAddressEn: z3.string().optional(),
    storeLogo: z3.string().optional(),
    taxNumber: z3.string().optional(),
    taxRate: z3.string().optional(),
    currency: z3.string().optional(),
    currencySymbol: z3.string().optional(),
    invoiceNote: z3.string().optional(),
    invoiceNoteEn: z3.string().optional(),
    whatsappEnabled: z3.boolean().optional(),
    whatsappInstance: z3.string().optional(),
    whatsappApiKey: z3.string().optional(),
    whatsappApiBase: z3.string().optional(),
    whatsappTemplate: z3.string().optional(),
    myfatoorahEnabled: z3.boolean().optional(),
    myfatoorahToken: z3.string().optional(),
    myfatoorahEnv: z3.enum(["sandbox", "live"]).optional(),
    myfatoorahSupplier: z3.string().optional(),
    // ثابت = 24 لـ Darin Madani
    priceIncludesTax: z3.boolean().optional()
  })).mutation(async ({ input }) => {
    await updateSettings(input);
    return { success: true };
  }),
  // Warehouses
  getWarehouses: protectedProcedure.query(async () => {
    return await getWarehouses(false);
  }),
  createWarehouse: adminOnly.input(z3.object({
    name: z3.string().min(1),
    nameEn: z3.string().optional(),
    description: z3.string().optional(),
    isDefault: z3.boolean().optional(),
    isActive: z3.boolean().optional()
  })).mutation(async ({ input }) => {
    await createWarehouse(input);
    return { success: true };
  }),
  updateWarehouse: adminOnly.input(z3.object({
    id: z3.number(),
    name: z3.string().optional(),
    nameEn: z3.string().optional(),
    description: z3.string().optional(),
    isDefault: z3.boolean().optional(),
    isActive: z3.boolean().optional()
  })).mutation(async ({ input: { id, ...data } }) => {
    await updateWarehouse(id, data);
    return { success: true };
  }),
  deleteWarehouse: adminOnly.input(z3.object({ id: z3.number() })).mutation(async ({ input }) => {
    await deleteWarehouse(input.id);
    return { success: true };
  }),
  // Categories
  getCategories: protectedProcedure.query(async () => {
    return await getCategories();
  }),
  createCategory: adminOnly.input(z3.object({
    name: z3.string().min(1),
    nameEn: z3.string().optional(),
    parentId: z3.number().optional(),
    sortOrder: z3.number().optional()
  })).mutation(async ({ input }) => {
    await createCategory(input);
    return { success: true };
  }),
  updateCategory: adminOnly.input(z3.object({
    id: z3.number(),
    name: z3.string().optional(),
    nameEn: z3.string().optional(),
    sortOrder: z3.number().optional(),
    isActive: z3.boolean().optional()
  })).mutation(async ({ input: { id, ...data } }) => {
    await updateCategory(id, data);
    return { success: true };
  }),
  deleteCategory: adminOnly.input(z3.object({ id: z3.number() })).mutation(async ({ input }) => {
    await deleteCategory(input.id);
    return { success: true };
  }),
  // Discounts
  getDiscounts: protectedProcedure.query(async () => {
    return await getDiscounts(false);
  }),
  createDiscount: adminOnly.input(z3.object({
    name: z3.string().min(1),
    nameEn: z3.string().optional(),
    type: z3.enum(["percentage", "fixed"]),
    value: z3.string(),
    minPurchase: z3.string().optional(),
    maxUses: z3.number().optional(),
    isActive: z3.boolean().optional(),
    startDate: z3.date().optional(),
    endDate: z3.date().optional()
  })).mutation(async ({ input }) => {
    await createDiscount(input);
    return { success: true };
  }),
  updateDiscount: adminOnly.input(z3.object({
    id: z3.number(),
    name: z3.string().optional(),
    nameEn: z3.string().optional(),
    type: z3.enum(["percentage", "fixed"]).optional(),
    value: z3.string().optional(),
    minPurchase: z3.string().optional(),
    maxUses: z3.number().optional(),
    isActive: z3.boolean().optional(),
    startDate: z3.date().optional(),
    endDate: z3.date().optional()
  })).mutation(async ({ input: { id, ...data } }) => {
    await updateDiscount(id, data);
    return { success: true };
  }),
  deleteDiscount: adminOnly.input(z3.object({ id: z3.number() })).mutation(async ({ input }) => {
    await deleteDiscount(input.id);
    return { success: true };
  })
});

// server/routers/products.ts
init_db();
import { z as z4 } from "zod";
import { TRPCError as TRPCError5 } from "@trpc/server";
import { nanoid } from "nanoid";
var adminOrManager = protectedProcedure.use(({ ctx, next }) => {
  if (!["admin", "manager", "warehouse"].includes(ctx.user.role))
    throw new TRPCError5({ code: "FORBIDDEN" });
  return next({ ctx });
});
var productsRouter = router({
  list: protectedProcedure.input(z4.object({
    search: z4.string().optional(),
    categoryId: z4.number().optional(),
    warehouseId: z4.number().optional(),
    lowStock: z4.boolean().optional()
  }).optional()).query(async ({ input }) => {
    return await getProducts(input);
  }),
  get: protectedProcedure.input(z4.object({ id: z4.number() })).query(async ({ input }) => {
    const p = await getProductById(input.id);
    if (!p) throw new TRPCError5({ code: "NOT_FOUND" });
    return p;
  }),
  getByBarcode: protectedProcedure.input(z4.object({ barcode: z4.string() })).query(async ({ input }) => {
    const p = await getProductByBarcode(input.barcode);
    if (!p) throw new TRPCError5({ code: "NOT_FOUND", message: "Product not found" });
    return p;
  }),
  create: adminOrManager.input(z4.object({
    name: z4.string().min(1),
    nameEn: z4.string().optional(),
    description: z4.string().optional(),
    descriptionEn: z4.string().optional(),
    categoryId: z4.number().optional(),
    color: z4.string().optional(),
    colorEn: z4.string().optional(),
    colorHex: z4.string().optional(),
    size: z4.string().optional(),
    costPrice: z4.string().optional(),
    salePrice: z4.string(),
    images: z4.array(z4.string()).optional(),
    lowStockAlert: z4.number().optional(),
    sku: z4.string().optional(),
    // Initial stock per warehouse
    initialStock: z4.array(z4.object({ warehouseId: z4.number(), qty: z4.number() })).optional()
  })).mutation(async ({ input, ctx }) => {
    const { initialStock, ...productData } = input;
    const barcode = `DM${Date.now()}${Math.floor(Math.random() * 100)}`;
    const sku = productData.sku || `SKU-${nanoid(8).toUpperCase()}`;
    const id = await createProduct({ ...productData, barcode, sku, images: productData.images || [] });
    if (!id) throw new TRPCError5({ code: "INTERNAL_SERVER_ERROR" });
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
  update: adminOrManager.input(z4.object({
    id: z4.number(),
    name: z4.string().optional(),
    nameEn: z4.string().optional(),
    description: z4.string().optional(),
    descriptionEn: z4.string().optional(),
    categoryId: z4.number().optional().nullable(),
    color: z4.string().optional(),
    colorEn: z4.string().optional(),
    colorHex: z4.string().optional(),
    size: z4.string().optional(),
    costPrice: z4.string().optional(),
    salePrice: z4.string().optional(),
    images: z4.array(z4.string()).optional(),
    lowStockAlert: z4.number().optional(),
    isActive: z4.boolean().optional()
  })).mutation(async ({ input: { id, ...data } }) => {
    await updateProduct(id, data);
    return { success: true };
  }),
  delete: adminOrManager.input(z4.object({ id: z4.number() })).mutation(async ({ input }) => {
    await deleteProduct(input.id);
    return { success: true };
  }),
  // Stock management
  getStock: protectedProcedure.input(z4.object({
    productId: z4.number().optional(),
    warehouseId: z4.number().optional()
  })).query(async ({ input }) => {
    if (input.productId) return await getProductStock(input.productId, input.warehouseId);
    return [];
  }),
  addPurchase: adminOrManager.input(z4.object({
    productId: z4.number(),
    warehouseId: z4.number(),
    qty: z4.number().min(1),
    costPrice: z4.string().optional(),
    notes: z4.string().optional(),
    reference: z4.string().optional()
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
  transferStock: adminOrManager.input(z4.object({
    productId: z4.number(),
    fromWarehouseId: z4.number(),
    toWarehouseId: z4.number(),
    qty: z4.number().min(1),
    notes: z4.string().optional()
  })).mutation(async ({ input, ctx }) => {
    const fromStock = await getProductStock(input.productId, input.fromWarehouseId);
    const available = fromStock[0]?.qty || 0;
    if (available < input.qty) throw new TRPCError5({ code: "BAD_REQUEST", message: "Insufficient stock" });
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
  adjustStock: adminOrManager.input(z4.object({
    productId: z4.number(),
    warehouseId: z4.number(),
    newQty: z4.number().min(0),
    notes: z4.string().optional()
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
  getMovements: protectedProcedure.input(z4.object({
    productId: z4.number().optional(),
    warehouseId: z4.number().optional()
  })).query(async ({ input }) => {
    return await getStockMovements(input.productId, input.warehouseId);
  })
});

// server/routers/customers.ts
init_db();
import { z as z5 } from "zod";
import { TRPCError as TRPCError6 } from "@trpc/server";
var customersRouter = router({
  list: protectedProcedure.input(z5.object({ search: z5.string().optional() }).optional()).query(async ({ input }) => {
    return await getCustomers(input?.search);
  }),
  get: protectedProcedure.input(z5.object({ id: z5.number() })).query(async ({ input }) => {
    const c = await getCustomerById(input.id);
    if (!c) throw new TRPCError6({ code: "NOT_FOUND" });
    const invoiceList = await getInvoices({ customerId: input.id });
    return { ...c, invoices: invoiceList };
  }),
  create: protectedProcedure.input(z5.object({
    name: z5.string().min(1),
    phone: z5.string().optional(),
    email: z5.string().optional(),
    city: z5.string().optional(),
    address: z5.string().optional(),
    notes: z5.string().optional()
  })).mutation(async ({ input }) => {
    const id = await createCustomer(input);
    return { success: true, id };
  }),
  update: protectedProcedure.input(z5.object({
    id: z5.number(),
    name: z5.string().optional(),
    phone: z5.string().optional(),
    email: z5.string().optional(),
    city: z5.string().optional(),
    address: z5.string().optional(),
    notes: z5.string().optional()
  })).mutation(async ({ input: { id, ...data } }) => {
    await updateCustomer(id, data);
    return { success: true };
  }),
  delete: protectedProcedure.input(z5.object({ id: z5.number() })).mutation(async ({ input }) => {
    await deleteCustomer(input.id);
    return { success: true };
  }),
  // Discounts
  listDiscounts: protectedProcedure.input(z5.object({ activeOnly: z5.boolean().optional() }).optional()).query(async ({ input }) => {
    return await getDiscounts(input?.activeOnly);
  }),
  createDiscount: protectedProcedure.input(z5.object({
    name: z5.string().min(1),
    nameEn: z5.string().optional(),
    type: z5.enum(["percentage", "fixed"]),
    value: z5.string(),
    minAmount: z5.string().optional(),
    maxUses: z5.number().optional(),
    isActive: z5.boolean().optional(),
    startDate: z5.date().optional(),
    endDate: z5.date().optional()
  })).mutation(async ({ input }) => {
    const id = await createDiscount(input);
    return { success: true, id };
  }),
  updateDiscount: protectedProcedure.input(z5.object({
    id: z5.number(),
    name: z5.string().optional(),
    nameEn: z5.string().optional(),
    type: z5.enum(["percentage", "fixed"]).optional(),
    value: z5.string().optional(),
    minAmount: z5.string().optional(),
    maxUses: z5.number().optional(),
    isActive: z5.boolean().optional(),
    startDate: z5.date().optional(),
    endDate: z5.date().optional()
  })).mutation(async ({ input: { id, ...data } }) => {
    await updateDiscount(id, data);
    return { success: true };
  }),
  deleteDiscount: protectedProcedure.input(z5.object({ id: z5.number() })).mutation(async ({ input }) => {
    await deleteDiscount(input.id);
    return { success: true };
  })
});

// server/routers/invoices.ts
init_db();
import { z as z6 } from "zod";
import { sql as sql2 } from "drizzle-orm";
import { TRPCError as TRPCError7 } from "@trpc/server";
import { nanoid as nanoid2 } from "nanoid";
import axios from "axios";
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
    const res = await axios.post(
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
    const res = await axios.post(`${base}/v2/SendPayment`, payload, {
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
  list: protectedProcedure.input(z6.object({
    search: z6.string().optional(),
    status: z6.string().optional(),
    from: z6.date().optional(),
    to: z6.date().optional(),
    customerId: z6.number().optional()
  }).optional()).query(async ({ input }) => {
    return await getInvoices(input);
  }),
  get: protectedProcedure.input(z6.object({ id: z6.number() })).query(async ({ input }) => {
    const inv = await getInvoiceById(input.id);
    if (!inv) throw new TRPCError7({ code: "NOT_FOUND" });
    return inv;
  }),
  getByToken: publicProcedure.input(z6.object({ token: z6.string() })).query(async ({ input }) => {
    const inv = await getInvoiceByToken(input.token);
    if (!inv) throw new TRPCError7({ code: "NOT_FOUND" });
    return inv;
  }),
  create: protectedProcedure.input(z6.object({
    customerId: z6.number().optional(),
    customerName: z6.string().optional(),
    customerPhone: z6.string().optional(),
    warehouseId: z6.number().optional(),
    items: z6.array(z6.object({
      productId: z6.number().optional(),
      productName: z6.string(),
      productNameEn: z6.string().optional(),
      barcode: z6.string().optional(),
      color: z6.string().optional(),
      size: z6.string().optional(),
      qty: z6.number().min(1),
      unitPrice: z6.string(),
      discountPct: z6.string().optional(),
      lineTotal: z6.string()
    })),
    subtotal: z6.string(),
    discountType: z6.enum(["percentage", "fixed", "none"]).optional(),
    discountValue: z6.string().optional(),
    discountAmount: z6.string().optional(),
    discountId: z6.number().optional(),
    taxRate: z6.string().optional(),
    taxAmount: z6.string().optional(),
    total: z6.string(),
    paymentMethod: z6.enum(["cash", "card", "transfer", "electronic", "mixed"]).optional(),
    paymentSplits: z6.array(z6.object({
      method: z6.enum(["cash", "card", "transfer", "electronic"]),
      amount: z6.string()
    })).optional(),
    notes: z6.string().optional(),
    origin: z6.string().optional()
  })).mutation(async ({ input, ctx }) => {
    const invoiceNumber = await generateInvoiceNumber();
    const token = nanoid2(32);
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
    if (!id) throw new TRPCError7({ code: "INTERNAL_SERVER_ERROR" });
    if (input.paymentMethod === "mixed" && input.paymentSplits && input.paymentSplits.length > 0) {
      const db = await getDb();
      if (db) {
        for (const split of input.paymentSplits) {
          if (parseFloat(split.amount) > 0) {
            const invoiceId = id;
            const method = split.method;
            const amount = split.amount;
            await db.execute(sql2`INSERT INTO invoice_payments (invoiceId, method, amount, createdAt) VALUES (${invoiceId}, ${method}, ${amount}, NOW())`);
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
  sendWhatsApp: protectedProcedure.input(z6.object({
    invoiceId: z6.number(),
    phone: z6.string(),
    message: z6.string().optional(),
    origin: z6.string().optional()
  })).mutation(async ({ input }) => {
    const settings2 = await getSettings();
    const inv = await getInvoiceById(input.invoiceId);
    if (!inv) throw new TRPCError7({ code: "NOT_FOUND" });
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
        throw new TRPCError7({ code: "PRECONDITION_FAILED", message: "\u0648\u0627\u062A\u0633\u0627\u0628 \u063A\u064A\u0631 \u0645\u0631\u0628\u0648\u0637. \u064A\u0631\u062C\u0649 \u0631\u0628\u0637 \u0627\u0644\u0648\u0627\u062A\u0633\u0627\u0628 \u0645\u0646 \u0635\u0641\u062D\u0629 \u0627\u0644\u0625\u0639\u062F\u0627\u062F\u0627\u062A" });
      }
      throw new TRPCError7({ code: "INTERNAL_SERVER_ERROR", message: "\u0641\u0634\u0644 \u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0631\u0633\u0627\u0644\u0629 \u0639\u0628\u0631 \u0648\u0627\u062A\u0633\u0627\u0628. \u062A\u062D\u0642\u0642 \u0645\u0646 \u0627\u062A\u0635\u0627\u0644 \u0627\u0644\u0648\u0627\u062A\u0633\u0627\u0628 \u0648\u0631\u0642\u0645 \u0627\u0644\u0647\u0627\u062A\u0641" });
    }
  }),
  createPaymentLink: protectedProcedure.input(z6.object({
    invoiceId: z6.number(),
    origin: z6.string()
  })).mutation(async ({ input }) => {
    const settings2 = await getSettings();
    const inv = await getInvoiceById(input.invoiceId);
    if (!inv) throw new TRPCError7({ code: "NOT_FOUND" });
    const mfData = await createMyfatoorahPayment(inv, settings2, input.origin);
    if (!mfData) throw new TRPCError7({ code: "INTERNAL_SERVER_ERROR", message: "Payment gateway error" });
    await updateInvoice(input.invoiceId, { mfInvoiceId: String(mfData.invoiceId), mfPaymentUrl: mfData.paymentUrl, mfQrCode: mfData.qrCode });
    return { success: true, ...mfData };
  }),
  cancel: protectedProcedure.input(z6.object({ id: z6.number() })).mutation(async ({ input }) => {
    await updateInvoice(input.id, { status: "cancelled" });
    return { success: true };
  }),
  // Returns
  listReturns: protectedProcedure.input(z6.object({ search: z6.string().optional() }).optional()).query(async ({ input }) => {
    return await getReturns(input?.search);
  }),
  getReturn: protectedProcedure.input(z6.object({ id: z6.number() })).query(async ({ input }) => {
    const r = await getReturnById(input.id);
    if (!r) throw new TRPCError7({ code: "NOT_FOUND" });
    return r;
  }),
  createReturn: protectedProcedure.input(z6.object({
    invoiceId: z6.number(),
    invoiceNumber: z6.string().optional(),
    customerId: z6.number().optional(),
    customerName: z6.string().optional(),
    warehouseId: z6.number().optional(),
    items: z6.array(z6.object({
      productId: z6.number().optional(),
      productName: z6.string(),
      barcode: z6.string().optional(),
      color: z6.string().optional(),
      size: z6.string().optional(),
      qty: z6.number().min(1),
      unitPrice: z6.string(),
      lineTotal: z6.string()
    })),
    refundAmount: z6.string(),
    refundMethod: z6.enum(["cash", "card", "transfer", "credit"]).optional(),
    reason: z6.string().optional()
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
    if (!id) throw new TRPCError7({ code: "INTERNAL_SERVER_ERROR" });
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
  checkPaymentStatus: protectedProcedure.input(z6.object({
    invoiceId: z6.number()
  })).query(async ({ input }) => {
    const inv = await getInvoiceById(input.invoiceId);
    if (!inv) throw new TRPCError7({ code: "NOT_FOUND" });
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
      const res = await axios.post(
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
init_db();
import { z as z7 } from "zod";
import { TRPCError as TRPCError8 } from "@trpc/server";
import bcrypt2 from "bcryptjs";
var adminOnly2 = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") throw new TRPCError8({ code: "FORBIDDEN" });
  return next({ ctx });
});
async function hashPassword(password) {
  return bcrypt2.hash(password, 12);
}
var usersRouter = router({
  list: adminOnly2.query(async () => {
    const users2 = await getAllUsers();
    return users2.map((u) => ({ ...u, passwordHash: void 0 }));
  }),
  get: adminOnly2.input(z7.object({ id: z7.number() })).query(async ({ input }) => {
    const u = await getUserById(input.id);
    if (!u) throw new TRPCError8({ code: "NOT_FOUND" });
    const permissions = await getUserPermissions(u.id);
    return { ...u, passwordHash: void 0, permissions };
  }),
  create: adminOnly2.input(z7.object({
    username: z7.string().min(3),
    password: z7.string().min(4),
    name: z7.string().min(1),
    nameEn: z7.string().optional(),
    email: z7.string().optional(),
    phone: z7.string().optional(),
    role: z7.enum(["admin", "manager", "cashier", "warehouse"]),
    isActive: z7.boolean().optional(),
    language: z7.enum(["ar", "en"]).optional(),
    permissions: z7.array(z7.object({
      module: z7.string(),
      action: z7.string(),
      allowed: z7.boolean()
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
  update: adminOnly2.input(z7.object({
    id: z7.number(),
    name: z7.string().optional(),
    nameEn: z7.string().optional(),
    email: z7.string().optional(),
    phone: z7.string().optional(),
    role: z7.enum(["admin", "manager", "cashier", "warehouse"]).optional(),
    isActive: z7.boolean().optional(),
    language: z7.enum(["ar", "en"]).optional(),
    password: z7.string().optional(),
    permissions: z7.array(z7.object({
      module: z7.string(),
      action: z7.string(),
      allowed: z7.boolean()
    })).optional()
  })).mutation(async ({ input: { id, password, permissions, ...data } }) => {
    const updateData = { ...data };
    if (password) updateData.passwordHash = await hashPassword(password);
    await updateUser(id, updateData);
    if (permissions) await setUserPermissions(id, permissions);
    return { success: true };
  }),
  delete: adminOnly2.input(z7.object({ id: z7.number() })).mutation(async ({ input, ctx }) => {
    if (input.id === ctx.user.id) throw new TRPCError8({ code: "BAD_REQUEST", message: "Cannot delete yourself" });
    await deleteUser(input.id);
    return { success: true };
  }),
  getPermissions: adminOnly2.input(z7.object({ userId: z7.number() })).query(async ({ input }) => {
    return await getUserPermissions(input.userId);
  }),
  setPermissions: adminOnly2.input(z7.object({
    userId: z7.number(),
    permissions: z7.array(z7.object({
      module: z7.string(),
      action: z7.string(),
      allowed: z7.boolean()
    }))
  })).mutation(async ({ input }) => {
    await setUserPermissions(input.userId, input.permissions);
    return { success: true };
  }),
  // Reports
  dashboardStats: protectedProcedure.query(async () => {
    return await getDashboardStats();
  }),
  topProducts: protectedProcedure.input(z7.object({ limit: z7.number().optional() }).optional()).query(async ({ input }) => {
    return await getTopProducts(input?.limit);
  }),
  monthlySales: protectedProcedure.input(z7.object({ months: z7.number().optional() }).optional()).query(async ({ input }) => {
    return await getMonthlySales(input?.months);
  }),
  lowStockProducts: protectedProcedure.query(async () => {
    return await getLowStockProducts();
  }),
  // Current user profile
  updateProfile: protectedProcedure.input(z7.object({
    name: z7.string().optional(),
    language: z7.enum(["ar", "en"]).optional(),
    phone: z7.string().optional()
  })).mutation(async ({ input, ctx }) => {
    await updateUser(ctx.user.id, input);
    return { success: true };
  })
});

// server/routers/whatsapp.ts
import { z as z8 } from "zod";
init_db();
init_schema();
import { eq as eq2 } from "drizzle-orm";
var EVO_BASE = process.env.WHATSAPP_API_BASE || "https://elv.academy-smart.com";
var EVO_APIKEY = process.env.WHATSAPP_API_KEY || "BQYHJGJHJ";
async function evoFetch(path3, method = "GET", body) {
  const res = await fetch(`${EVO_BASE}${path3}`, {
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
    await db.update(settings).set({ whatsappInstance: instanceName }).where(eq2(settings.id, rows[0].id));
  } else {
    await db.insert(settings).values({ whatsappInstance: instanceName });
  }
}
async function clearInstanceName() {
  const db = await getDb();
  if (!db) return;
  const rows = await db.select().from(settings).limit(1);
  if (rows.length > 0) {
    await db.update(settings).set({ whatsappInstance: null }).where(eq2(settings.id, rows[0].id));
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
  createInstance: protectedProcedure.input(z8.object({ number: z8.string().min(9) })).mutation(async ({ input }) => {
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
    z8.object({
      phone: z8.string(),
      message: z8.string()
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
import { z as z9 } from "zod";
init_db();
init_schema();
init_db();
import { eq as eq3 } from "drizzle-orm";
import crypto2 from "crypto";
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
    z9.object({
      // Cart totals
      subtotal: z9.number(),
      discountAmount: z9.number().default(0),
      discountType: z9.string().optional(),
      discountValue: z9.number().optional(),
      discountId: z9.number().optional(),
      taxRate: z9.number().default(0),
      taxAmount: z9.number().default(0),
      total: z9.number(),
      // Customer
      customerId: z9.number().optional(),
      customerName: z9.string().optional(),
      customerPhone: z9.string().optional(),
      warehouseId: z9.number().optional(),
      notes: z9.string().optional(),
      // Cart items (JSON)
      cartJson: z9.string(),
      // Origin for callback URL
      origin: z9.string()
    })
  ).mutation(async ({ input, ctx }) => {
    const settings2 = await getSettings();
    if (!settings2?.myfatoorahToken) {
      throw new Error("MyFatoorah \u063A\u064A\u0631 \u0645\u0641\u0639\u0651\u0644 - \u064A\u0631\u062C\u0649 \u0625\u062F\u062E\u0627\u0644 \u0627\u0644\u0640 Token \u0641\u064A \u0627\u0644\u0625\u0639\u062F\u0627\u062F\u0627\u062A");
    }
    const db = await getDb();
    if (!db) throw new Error("DB connection failed");
    const token = crypto2.randomBytes(24).toString("hex");
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
  checkPaymentRequest: protectedProcedure.input(z9.object({ token: z9.string() })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return { status: "pending", invoiceId: null };
    const rows = await db.select().from(paymentRequests).where(eq3(paymentRequests.token, input.token)).limit(1);
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
import { jwtVerify } from "jose";
import { parse as parseCookieHeader } from "cookie";
function getSessionSecret2() {
  const secret = process.env.JWT_SECRET || "darin-madani-secret-key-2024";
  return new TextEncoder().encode(secret);
}
async function createContext(opts) {
  let user = null;
  try {
    const cookieHeader = opts.req.headers.cookie;
    const cookies = cookieHeader ? parseCookieHeader(cookieHeader) : {};
    const token = cookies[COOKIE_NAME];
    if (token) {
      const secretKey = getSessionSecret2();
      const { payload } = await jwtVerify(token, secretKey, { algorithms: ["HS256"] });
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

// server/_core/vite.ts
import express from "express";
import fs2 from "fs";
import { nanoid as nanoid3 } from "nanoid";
import path2 from "path";
import { createServer as createViteServer } from "vite";

// vite.config.ts
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "vite";
import { vitePluginManusRuntime } from "vite-plugin-manus-runtime";
var PROJECT_ROOT = typeof __dirname !== "undefined" ? __dirname : import.meta.dirname ?? process.cwd();
var LOG_DIR = path.join(PROJECT_ROOT, ".manus-logs");
var MAX_LOG_SIZE_BYTES = 1 * 1024 * 1024;
var TRIM_TARGET_BYTES = Math.floor(MAX_LOG_SIZE_BYTES * 0.6);
function ensureLogDir() {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}
function trimLogFile(logPath, maxSize) {
  try {
    if (!fs.existsSync(logPath) || fs.statSync(logPath).size <= maxSize) {
      return;
    }
    const lines = fs.readFileSync(logPath, "utf-8").split("\n");
    const keptLines = [];
    let keptBytes = 0;
    const targetSize = TRIM_TARGET_BYTES;
    for (let i = lines.length - 1; i >= 0; i--) {
      const lineBytes = Buffer.byteLength(`${lines[i]}
`, "utf-8");
      if (keptBytes + lineBytes > targetSize) break;
      keptLines.unshift(lines[i]);
      keptBytes += lineBytes;
    }
    fs.writeFileSync(logPath, keptLines.join("\n"), "utf-8");
  } catch {
  }
}
function writeToLogFile(source, entries) {
  if (entries.length === 0) return;
  ensureLogDir();
  const logPath = path.join(LOG_DIR, `${source}.log`);
  const lines = entries.map((entry) => {
    const ts = (/* @__PURE__ */ new Date()).toISOString();
    return `[${ts}] ${JSON.stringify(entry)}`;
  });
  fs.appendFileSync(logPath, `${lines.join("\n")}
`, "utf-8");
  trimLogFile(logPath, MAX_LOG_SIZE_BYTES);
}
function vitePluginManusDebugCollector() {
  return {
    name: "manus-debug-collector",
    transformIndexHtml(html) {
      if (process.env.NODE_ENV === "production") {
        return html;
      }
      return {
        html,
        tags: [
          {
            tag: "script",
            attrs: {
              src: "/__manus__/debug-collector.js",
              defer: true
            },
            injectTo: "head"
          }
        ]
      };
    },
    configureServer(server) {
      server.middlewares.use("/__manus__/logs", (req, res, next) => {
        if (req.method !== "POST") {
          return next();
        }
        const handlePayload = (payload) => {
          if (payload.consoleLogs?.length > 0) {
            writeToLogFile("browserConsole", payload.consoleLogs);
          }
          if (payload.networkRequests?.length > 0) {
            writeToLogFile("networkRequests", payload.networkRequests);
          }
          if (payload.sessionEvents?.length > 0) {
            writeToLogFile("sessionReplay", payload.sessionEvents);
          }
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: true }));
        };
        const reqBody = req.body;
        if (reqBody && typeof reqBody === "object") {
          try {
            handlePayload(reqBody);
          } catch (e) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, error: String(e) }));
          }
          return;
        }
        let body = "";
        req.on("data", (chunk) => {
          body += chunk.toString();
        });
        req.on("end", () => {
          try {
            const payload = JSON.parse(body);
            handlePayload(payload);
          } catch (e) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, error: String(e) }));
          }
        });
      });
    }
  };
}
var plugins = [react(), tailwindcss(), vitePluginManusRuntime(), vitePluginManusDebugCollector()];
var vite_config_default = defineConfig({
  plugins,
  resolve: {
    alias: {
      "@": path.resolve(PROJECT_ROOT, "client", "src"),
      "@shared": path.resolve(PROJECT_ROOT, "shared"),
      "@assets": path.resolve(PROJECT_ROOT, "attached_assets")
    }
  },
  envDir: path.resolve(PROJECT_ROOT),
  root: path.resolve(PROJECT_ROOT, "client"),
  publicDir: path.resolve(PROJECT_ROOT, "client", "public"),
  build: {
    outDir: path.resolve(PROJECT_ROOT, "dist/public"),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
        entryFileNames: "assets/index.js",
        assetFileNames: "assets/index.[ext]"
      }
    }
  },
  server: {
    host: true,
    allowedHosts: [
      ".manuspre.computer",
      ".manus.computer",
      ".manus-asia.computer",
      ".manuscomputer.ai",
      ".manusvm.computer",
      "localhost",
      "127.0.0.1"
    ],
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/_core/vite.ts
var _dirname = typeof __dirname !== "undefined" ? __dirname : typeof import.meta.dirname === "string" ? import.meta.dirname : process.cwd();
async function setupVite(app, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    server: serverOptions,
    appType: "custom"
  });
  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        _dirname,
        "../..",
        "client",
        "index.html"
      );
      let template = await fs2.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid3()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app) {
  const distPath = process.env.NODE_ENV === "development" ? path2.resolve(_dirname, "../..", "dist", "public") : path2.resolve(_dirname, "public");
  if (!fs2.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app.use(express.static(distPath));
  app.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
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

// server/_core/index.ts
import { jwtVerify as jwtVerify2 } from "jose";
import { parse as parseCookieHeader2 } from "cookie";
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}
async function findAvailablePort(startPort = 3e3) {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}
async function startServer() {
  const app = express2();
  const server = createServer(app);
  app.use(express2.json({ limit: "50mb" }));
  app.use(express2.urlencoded({ limit: "50mb", extended: true }));
  registerStorageProxy(app);
  const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
  const getSessionSecret3 = () => new TextEncoder().encode(process.env.JWT_SECRET || "darin-madani-secret-key-2024");
  app.post("/api/upload", upload.single("file"), async (req, res) => {
    try {
      const cookieHeader = req.headers.cookie;
      const cookies = cookieHeader ? parseCookieHeader2(cookieHeader) : {};
      const token = cookies[COOKIE_NAME];
      if (!token) return res.status(401).json({ error: "Unauthorized" });
      await jwtVerify2(token, getSessionSecret3(), { algorithms: ["HS256"] });
      if (!req.file) return res.status(400).json({ error: "No file" });
      const ext = req.file.originalname.split(".").pop() || "jpg";
      const key = `products/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
      const { url } = await storagePut(key, req.file.buffer, req.file.mimetype);
      res.json({ url });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
  app.get("/api/payment-callback", async (req, res) => {
    try {
      const token = req.query.token;
      const status = req.query.status;
      if (token) {
        const { getDb: getDb2 } = await Promise.resolve().then(() => (init_db(), db_exports));
        const { paymentRequests: paymentRequests2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
        const { eq: eq4 } = await import("drizzle-orm");
        const { getSettings: getSettings2, createInvoice: dbCreateInvoice } = await Promise.resolve().then(() => (init_db(), db_exports));
        const db = await getDb2();
        if (!db) return res.redirect("/pos?payment=error");
        const rows = await db.select().from(paymentRequests2).where(eq4(paymentRequests2.token, token)).limit(1);
        const pr = rows[0];
        if (!pr) return res.redirect("/pos?payment=error&reason=not_found");
        if (status === "error") {
          await db.update(paymentRequests2).set({ status: "failed", mfStatus: "FAILED" }).where(eq4(paymentRequests2.token, token));
          return res.redirect("/pos?payment=failed");
        }
        const settings2 = await getSettings2();
        let isPaid = false;
        if (pr.mfInvoiceId && settings2?.myfatoorahToken) {
          try {
            const axiosLib = (await import("axios")).default;
            const isLive = settings2.myfatoorahEnv === "live";
            const base = isLive ? "https://api.myfatoorah.com" : "https://apitest.myfatoorah.com";
            const mfRes = await axiosLib.post(
              `${base}/v2/GetPaymentStatus`,
              { Key: pr.mfInvoiceId, KeyType: "InvoiceId" },
              { headers: { Authorization: `Bearer ${settings2.myfatoorahToken}`, "Content-Type": "application/json" }, timeout: 1e4 }
            );
            const data = mfRes.data?.Data;
            const mfStatus = data?.InvoiceStatus || "";
            const transStatus = data?.InvoiceTransactions?.[0]?.TransactionStatus || "";
            isPaid = mfStatus === "Paid" || transStatus === "Succss" || transStatus === "Success";
          } catch (e) {
            console.error("[Callback] MF verify error:", e?.message);
          }
        }
        if (isPaid) {
          try {
            const { createInvoiceFromPaymentRequest: createInvoiceFromPaymentRequest2 } = await Promise.resolve().then(() => (init_db(), db_exports));
            const invoiceId2 = await createInvoiceFromPaymentRequest2(pr, settings2);
            await db.update(paymentRequests2).set({ status: "paid", mfStatus: "CAPTURED", invoiceId: invoiceId2 }).where(eq4(paymentRequests2.token, token));
            if (pr.customerPhone && settings2?.whatsappInstance) {
              try {
                const axiosLib = (await import("axios")).default;
                const base2 = (settings2.whatsappApiBase || "").replace(/\/$/, "");
                const formattedPhone = pr.customerPhone.replace(/\D/g, "").replace(/^0/, "966");
                const origin = req.headers.origin || `https://${req.headers.host}`;
                const invoiceLink = `${origin}/invoice/${invoiceId2}`;
                const msg = `\u0634\u0643\u0631\u0627\u064B \u0644\u0633\u062F\u0627\u062F\u0643 \u0628\u0646\u062C\u0627\u062D! \u0645\u0631\u062D\u0628\u0627\u064B ${pr.customerName || ""}

\u0641\u0627\u062A\u0648\u0631\u062A\u0643 \u062C\u0627\u0647\u0632\u0629:
${invoiceLink}`;
                await axiosLib.post(
                  `${base2}/message/sendText/${settings2.whatsappInstance}`,
                  { number: `${formattedPhone}@s.whatsapp.net`, text: msg },
                  { headers: { apikey: settings2.whatsappApiKey || "" }, timeout: 1e4 }
                );
              } catch (e) {
                console.error("[Callback] WhatsApp send error:", e?.message);
              }
            }
            return res.redirect(`/invoices?payment=success&id=${invoiceId2}`);
          } catch (e) {
            console.error("[Callback] Invoice creation error:", e?.message);
            return res.redirect("/pos?payment=error&reason=invoice_failed");
          }
        }
        return res.redirect("/pos?payment=pending");
      }
      const invoiceId = parseInt(req.query.invoice_id);
      if (!invoiceId || isNaN(invoiceId)) {
        return res.redirect("/invoices?payment=error");
      }
      const { updateInvoice: updateInvoice2, getInvoiceById: getInvoiceById2, getSettings: getSettingsLegacy } = await Promise.resolve().then(() => (init_db(), db_exports));
      const settingsLegacy = await getSettingsLegacy();
      if (status === "error") {
        await updateInvoice2(invoiceId, { mfStatus: "FAILED", paymentStatus: "pending" });
        return res.redirect(`/invoices?payment=failed&id=${invoiceId}`);
      }
      const inv = await getInvoiceById2(invoiceId);
      if (inv && inv.mfInvoiceId && settingsLegacy?.myfatoorahToken) {
        try {
          const axiosLib = (await import("axios")).default;
          const isLive = settingsLegacy.myfatoorahEnv === "live";
          const base = isLive ? "https://api.myfatoorah.com" : "https://apitest.myfatoorah.com";
          const mfRes = await axiosLib.post(
            `${base}/v2/GetPaymentStatus`,
            { Key: inv.mfInvoiceId, KeyType: "InvoiceId" },
            { headers: { Authorization: `Bearer ${settingsLegacy.myfatoorahToken}`, "Content-Type": "application/json" }, timeout: 1e4 }
          );
          const data = mfRes.data?.Data;
          const mfStatus = data?.InvoiceStatus || "";
          const transStatus = data?.InvoiceTransactions?.[0]?.TransactionStatus || "";
          const isPaidLegacy = mfStatus === "Paid" || transStatus === "Succss" || transStatus === "Success";
          if (isPaidLegacy) {
            await updateInvoice2(invoiceId, { paymentStatus: "paid", mfStatus: "CAPTURED" });
            return res.redirect(`/invoices?payment=success&id=${invoiceId}`);
          }
        } catch (e) {
          console.error("[Callback] MF verify error:", e?.message);
        }
      }
      return res.redirect(`/invoices?payment=pending&id=${invoiceId}`);
    } catch (e) {
      console.error("[Callback] Error:", e?.message);
      res.redirect("/invoices?payment=error");
    }
  });
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext
    })
  );
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const rawPort = process.env.PORT;
  const isNamedPipe = rawPort && isNaN(Number(rawPort));
  if (isNamedPipe) {
    server.listen(rawPort, () => {
      console.log(`Server running on named pipe: ${rawPort}`);
    });
  } else {
    const preferredPort = parseInt(rawPort || "3000");
    const port = await findAvailablePort(preferredPort);
    if (port !== preferredPort) {
      console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
    }
    server.listen(port, () => {
      console.log(`Server running on http://localhost:${port}/`);
    });
  }
}
startServer().catch(console.error);
