import { and, desc, eq, gte, ilike, like, lte, or, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser, categories, customers, discounts, invoiceItems,
  invoices, productStock, products, returnItems, returns,
  settings, stockMovements, userPermissions, users, warehouses,
  barcodeSerials, productColors, productSizes,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try { _db = drizzle(process.env.DATABASE_URL); }
    catch (e) { console.warn("[DB] connect failed:", e); _db = null; }
  }
  return _db;
}

// ─── USERS ─────────────────────────────────────────────────────────────────
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("openId required");
  const db = await getDb(); if (!db) return;
  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  (["name","email","loginMethod","phone","username","nameEn","passwordHash"] as const).forEach(f => {
    if (user[f] !== undefined) { values[f] = user[f] as any; updateSet[f] = user[f]; }
  });
  if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
  if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
  else if (user.openId === ENV.ownerOpenId) { values.role = "admin"; updateSet.role = "admin"; }
  if (!values.lastSignedIn) { values.lastSignedIn = new Date(); }
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb(); if (!db) return undefined;
  const r = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return r[0];
}

export async function getAllUsers() {
  const db = await getDb(); if (!db) return [];
  return db.select().from(users).orderBy(desc(users.createdAt));
}

export async function getUserById(id: number) {
  const db = await getDb(); if (!db) return undefined;
  const r = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return r[0];
}

export async function getUserByUsername(username: string) {
  const db = await getDb(); if (!db) return undefined;
  const r = await db.select().from(users).where(eq(users.username, username)).limit(1);
  return r[0];
}

export async function updateUser(id: number, data: Partial<InsertUser>) {
  const db = await getDb(); if (!db) return;
  await db.update(users).set(data).where(eq(users.id, id));
}

export async function deleteUser(id: number) {
  const db = await getDb(); if (!db) return;
  await db.delete(users).where(eq(users.id, id));
}

// ─── PERMISSIONS ───────────────────────────────────────────────────────────
export async function getUserPermissions(userId: number) {
  const db = await getDb(); if (!db) return [];
  return db.select().from(userPermissions).where(eq(userPermissions.userId, userId));
}

export async function setUserPermissions(userId: number, perms: { module: string; action: string; allowed: boolean }[]) {
  const db = await getDb(); if (!db) return;
  await db.delete(userPermissions).where(eq(userPermissions.userId, userId));
  if (perms.length > 0) {
    await db.insert(userPermissions).values(perms.map(p => ({ userId, ...p })));
  }
}

// ─── SETTINGS ──────────────────────────────────────────────────────────────
export async function getSettings() {
  const db = await getDb(); if (!db) return null;
  const r = await db.select().from(settings).limit(1);
  return r[0] ?? null;
}

export async function updateSettings(data: Partial<typeof settings.$inferInsert>) {
  const db = await getDb(); if (!db) return;
  const existing = await getSettings();
  if (existing) { await db.update(settings).set(data).where(eq(settings.id, existing.id)); }
  else { await db.insert(settings).values({ ...data } as any); }
}

// ─── WAREHOUSES ────────────────────────────────────────────────────────────
export async function getWarehouses(activeOnly = true) {
  const db = await getDb(); if (!db) return [];
  if (activeOnly) return db.select().from(warehouses).where(eq(warehouses.isActive, true));
  return db.select().from(warehouses);
}

export async function getWarehouseById(id: number) {
  const db = await getDb(); if (!db) return undefined;
  const r = await db.select().from(warehouses).where(eq(warehouses.id, id)).limit(1);
  return r[0];
}

export async function createWarehouse(data: typeof warehouses.$inferInsert) {
  const db = await getDb(); if (!db) return;
  await db.insert(warehouses).values(data);
}

export async function updateWarehouse(id: number, data: Partial<typeof warehouses.$inferInsert>) {
  const db = await getDb(); if (!db) return;
  await db.update(warehouses).set(data).where(eq(warehouses.id, id));
}

export async function deleteWarehouse(id: number) {
  const db = await getDb(); if (!db) return;
  await db.delete(warehouses).where(eq(warehouses.id, id));
}

// ─── CATEGORIES ────────────────────────────────────────────────────────────
export async function getCategories() {
  const db = await getDb(); if (!db) return [];
  return db.select().from(categories).where(eq(categories.isActive, true)).orderBy(categories.sortOrder);
}

export async function createCategory(data: typeof categories.$inferInsert) {
  const db = await getDb(); if (!db) return;
  await db.insert(categories).values(data);
}

export async function updateCategory(id: number, data: Partial<typeof categories.$inferInsert>) {
  const db = await getDb(); if (!db) return;
  await db.update(categories).set(data).where(eq(categories.id, id));
}

export async function deleteCategory(id: number) {
  const db = await getDb(); if (!db) return;
  await db.delete(categories).where(eq(categories.id, id));
}

// ─── PRODUCTS ──────────────────────────────────────────────────────────────
export async function getProducts(filters?: { search?: string; categoryId?: number; warehouseId?: number; lowStock?: boolean }) {
  const db = await getDb(); if (!db) return [];
  const conditions = [eq(products.isActive, true)];
  if (filters?.search) {
    const s = `%${filters.search}%`;
    conditions.push(or(like(products.name, s), like(products.nameEn, s), like(products.barcode, s), like(products.sku, s)) as any);
  }
  if (filters?.categoryId) conditions.push(eq(products.categoryId, filters.categoryId));
  const rows = await db.select().from(products).where(and(...conditions)).orderBy(desc(products.createdAt));
  // Attach stock
  const stockRows = await db.select().from(productStock);
  return rows.map(p => {
    const stock = stockRows.filter(s => s.productId === p.id);
    const totalQty = stock.reduce((a, b) => a + b.qty, 0);
    return { ...p, stock, totalQty };
  });
}

export async function getProductById(id: number) {
  const db = await getDb(); if (!db) return undefined;
  const r = await db.select().from(products).where(eq(products.id, id)).limit(1);
  if (!r[0]) return undefined;
  const stock = await db.select().from(productStock).where(eq(productStock.productId, id));
  return { ...r[0], stock, totalQty: stock.reduce((a, b) => a + b.qty, 0) };
}

export async function getProductByBarcode(barcode: string) {
  const db = await getDb(); if (!db) return undefined;
  const r = await db.select().from(products).where(eq(products.barcode, barcode)).limit(1);
  if (!r[0]) return undefined;
  const stock = await db.select().from(productStock).where(eq(productStock.productId, r[0].id));
  return { ...r[0], stock, totalQty: stock.reduce((a, b) => a + b.qty, 0) };
}

export async function createProduct(data: typeof products.$inferInsert) {
  const db = await getDb(); if (!db) return null;
  const [result] = await db.insert(products).values(data);
  return (result as any).insertId as number;
}

export async function updateProduct(id: number, data: Partial<typeof products.$inferInsert>) {
  const db = await getDb(); if (!db) return;
  await db.update(products).set({ ...data, updatedAt: new Date() }).where(eq(products.id, id));
}

export async function deleteProduct(id: number) {
  const db = await getDb(); if (!db) return;
  await db.update(products).set({ isActive: false }).where(eq(products.id, id));
}

// ─── STOCK ─────────────────────────────────────────────────────────────────
export async function getProductStock(productId: number, warehouseId?: number) {
  const db = await getDb(); if (!db) return [];
  const conds = [eq(productStock.productId, productId)];
  if (warehouseId) conds.push(eq(productStock.warehouseId, warehouseId));
  return db.select().from(productStock).where(and(...conds));
}

export async function upsertProductStock(productId: number, warehouseId: number, qty: number) {
  const db = await getDb(); if (!db) return;
  await db.insert(productStock).values({ productId, warehouseId, qty })
    .onDuplicateKeyUpdate({ set: { qty: sql`qty + ${qty}` } });
}

export async function setProductStock(productId: number, warehouseId: number, qty: number) {
  const db = await getDb(); if (!db) return;
  const existing = await db.select().from(productStock)
    .where(and(eq(productStock.productId, productId), eq(productStock.warehouseId, warehouseId))).limit(1);
  if (existing[0]) {
    await db.update(productStock).set({ qty }).where(eq(productStock.id, existing[0].id));
  } else {
    await db.insert(productStock).values({ productId, warehouseId, qty });
  }
}

export async function addStockMovement(data: typeof stockMovements.$inferInsert) {
  const db = await getDb(); if (!db) return;
  await db.insert(stockMovements).values(data);
}

export async function getStockMovements(productId?: number, warehouseId?: number) {
  const db = await getDb(); if (!db) return [];
  const conds: any[] = [];
  if (productId) conds.push(eq(stockMovements.productId, productId));
  if (warehouseId) conds.push(eq(stockMovements.warehouseId, warehouseId));
  return db.select().from(stockMovements).where(conds.length ? and(...conds) : undefined).orderBy(desc(stockMovements.createdAt)).limit(100);
}

// ─── BARCODE SERIALS ──────────────────────────────────────────────────────────
/**
 * Reserve N sequential serial numbers for a variant barcode.
 * Returns an array of serial numbers [start, start+1, ..., start+qty-1]
 * Uses atomic increment to avoid race conditions.
 */
export async function reserveBarcodeSerials(variantBarcode: string, qty: number): Promise<number[]> {
  const db = await getDb(); if (!db) return [];
  // Upsert: if row doesn't exist, create with lastSerial=0, then increment
  await db.insert(barcodeSerials)
    .values({ variantBarcode, lastSerial: qty })
    .onDuplicateKeyUpdate({ set: { lastSerial: sql`lastSerial + ${qty}` } });
  // Read the current value after increment
  const row = await db.select().from(barcodeSerials)
    .where(eq(barcodeSerials.variantBarcode, variantBarcode)).limit(1);
  const lastSerial = row[0]?.lastSerial ?? qty;
  // Return the range [lastSerial - qty + 1, ..., lastSerial]
  const start = lastSerial - qty + 1;
  return Array.from({ length: qty }, (_, i) => start + i);
}

export async function getLastBarcodeSerial(variantBarcode: string): Promise<number> {
  const db = await getDb(); if (!db) return 0;
  const row = await db.select().from(barcodeSerials)
    .where(eq(barcodeSerials.variantBarcode, variantBarcode)).limit(1);
  return row[0]?.lastSerial ?? 0;
}

// ─── PRODUCT VARIANTS ──────────────────────────────────────────────────────────
/**
 * Get all variants of a product by matching on the same name.
 * Returns each variant with its stock per warehouse.
 */
export async function getProductVariants(productId: number) {
  const db = await getDb(); if (!db) return [];
  // Get the base product
  const base = await db.select().from(products).where(eq(products.id, productId)).limit(1);
  if (!base[0]) return [];
  const baseName = base[0].name;
  // Find all active products with the same name
  const variants = await db.select().from(products)
    .where(and(eq(products.name, baseName), eq(products.isActive, true)))
    .orderBy(products.color, products.size);
  // Attach stock for all variants
  const variantIds = variants.map(v => v.id);
  if (!variantIds.length) return [];
  const stockRows = await db.select().from(productStock)
    .where(sql`${productStock.productId} IN (${sql.join(variantIds.map(id => sql`${id}`), sql`, `)})`);
  const warehouseRows = await db.select().from(warehouses).where(eq(warehouses.isActive, true));
  return variants.map(v => ({
    ...v,
    stock: stockRows.filter(s => s.productId === v.id),
    totalQty: stockRows.filter(s => s.productId === v.id).reduce((a, b) => a + b.qty, 0),
    warehouses: warehouseRows,
  }));
}

// ─── CUSTOMERS ─────────────────────────────────────────────────────────────
export async function getCustomers(search?: string) {
  const db = await getDb(); if (!db) return [];
  if (search) {
    const s = `%${search}%`;
    return db.select().from(customers).where(or(like(customers.name, s), like(customers.phone, s), like(customers.email, s)) as any).orderBy(desc(customers.createdAt));
  }
  return db.select().from(customers).orderBy(desc(customers.createdAt));
}

export async function getCustomerById(id: number) {
  const db = await getDb(); if (!db) return undefined;
  const r = await db.select().from(customers).where(eq(customers.id, id)).limit(1);
  return r[0];
}

export async function createCustomer(data: typeof customers.$inferInsert) {
  const db = await getDb(); if (!db) return null;
  const [result] = await db.insert(customers).values(data);
  return (result as any).insertId as number;
}

export async function updateCustomer(id: number, data: Partial<typeof customers.$inferInsert>) {
  const db = await getDb(); if (!db) return;
  await db.update(customers).set({ ...data, updatedAt: new Date() }).where(eq(customers.id, id));
}

export async function deleteCustomer(id: number) {
  const db = await getDb(); if (!db) return;
  await db.delete(customers).where(eq(customers.id, id));
}

// ─── DISCOUNTS ─────────────────────────────────────────────────────────────
export async function getDiscounts(activeOnly = false) {
  const db = await getDb(); if (!db) return [];
  if (activeOnly) return db.select().from(discounts).where(eq(discounts.isActive, true));
  return db.select().from(discounts).orderBy(desc(discounts.createdAt));
}

export async function createDiscount(data: typeof discounts.$inferInsert) {
  const db = await getDb(); if (!db) return null;
  const [result] = await db.insert(discounts).values(data);
  return (result as any).insertId as number;
}

export async function updateDiscount(id: number, data: Partial<typeof discounts.$inferInsert>) {
  const db = await getDb(); if (!db) return;
  await db.update(discounts).set(data).where(eq(discounts.id, id));
}

export async function deleteDiscount(id: number) {
  const db = await getDb(); if (!db) return;
  await db.delete(discounts).where(eq(discounts.id, id));
}

// ─── INVOICES ──────────────────────────────────────────────────────────────
export async function getInvoices(filters?: { search?: string; status?: string; from?: Date; to?: Date; customerId?: number }) {
  const db = await getDb(); if (!db) return [];
  const conds: any[] = [];
  if (filters?.search) {
    const s = `%${filters.search}%`;
    conds.push(or(like(invoices.invoiceNumber, s), like(invoices.customerName, s), like(invoices.customerPhone, s)) as any);
  }
  if (filters?.status) conds.push(eq(invoices.status, filters.status as any));
  if (filters?.from) conds.push(gte(invoices.createdAt, filters.from));
  if (filters?.to) conds.push(lte(invoices.createdAt, filters.to));
  if (filters?.customerId) conds.push(eq(invoices.customerId, filters.customerId));
  const rows = await db.select().from(invoices).where(conds.length ? and(...conds) : undefined).orderBy(desc(invoices.createdAt));
  return rows;
}

export async function getInvoiceById(id: number) {
  const db = await getDb(); if (!db) return undefined;
  const r = await db.select().from(invoices).where(eq(invoices.id, id)).limit(1);
  if (!r[0]) return undefined;
  const items = await db.select().from(invoiceItems).where(eq(invoiceItems.invoiceId, id));
  const settingsRows = await db.select().from(settings).limit(1);
  return { ...r[0], items, settings: settingsRows[0] || null };
}
export async function getInvoiceByToken(token: string) {
  const db = await getDb(); if (!db) return undefined;
  const r = await db.select().from(invoices).where(eq(invoices.token, token)).limit(1);
  if (!r[0]) return undefined;
  const items = await db.select().from(invoiceItems).where(eq(invoiceItems.invoiceId, r[0].id));
  const settingsRows = await db.select().from(settings).limit(1);
  return { ...r[0], items, settings: settingsRows[0] || null };
}

export async function createInvoice(data: typeof invoices.$inferInsert, items: typeof invoiceItems.$inferInsert[]) {
  const db = await getDb(); if (!db) return null;
  const [result] = await db.insert(invoices).values(data);
  const id = (result as any).insertId as number;
  if (items.length > 0) {
    await db.insert(invoiceItems).values(items.map(i => ({ ...i, invoiceId: id })));
  }
  return id;
}

export async function updateInvoice(id: number, data: Partial<typeof invoices.$inferInsert>) {
  const db = await getDb(); if (!db) return;
  await db.update(invoices).set({ ...data, updatedAt: new Date() }).where(eq(invoices.id, id));
}

export async function generateInvoiceNumber(): Promise<string> {
  const db = await getDb();
  if (!db) return `INV-${Date.now()}`;
  const today = new Date();
  const prefix = `INV-${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}`;
  const r = await db.select({ num: invoices.invoiceNumber }).from(invoices)
    .where(like(invoices.invoiceNumber, `${prefix}%`)).orderBy(desc(invoices.invoiceNumber)).limit(1);
  const last = r[0]?.num;
  const seq = last ? parseInt(last.split("-").pop() || "0") + 1 : 1;
  return `${prefix}-${String(seq).padStart(4, "0")}`;
}

// ─── RETURNS ───────────────────────────────────────────────────────────────
export async function getReturns(search?: string) {
  const db = await getDb(); if (!db) return [];
  if (search) {
    const s = `%${search}%`;
    return db.select().from(returns).where(or(like(returns.returnNumber, s), like(returns.invoiceNumber, s), like(returns.customerName, s)) as any).orderBy(desc(returns.createdAt));
  }
  return db.select().from(returns).orderBy(desc(returns.createdAt));
}

export async function getReturnById(id: number) {
  const db = await getDb(); if (!db) return undefined;
  const r = await db.select().from(returns).where(eq(returns.id, id)).limit(1);
  if (!r[0]) return undefined;
  const items = await db.select().from(returnItems).where(eq(returnItems.returnId, id));
  return { ...r[0], items };
}

export async function createReturn(data: typeof returns.$inferInsert, items: typeof returnItems.$inferInsert[]) {
  const db = await getDb(); if (!db) return null;
  const [result] = await db.insert(returns).values(data);
  const id = (result as any).insertId as number;
  if (items.length > 0) {
    await db.insert(returnItems).values(items.map(i => ({ ...i, returnId: id })));
  }
  return id;
}

export async function generateReturnNumber(): Promise<string> {
  const db = await getDb();
  if (!db) return `RET-${Date.now()}`;
  const today = new Date();
  const prefix = `RET-${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}`;
  const r = await db.select({ num: returns.returnNumber }).from(returns)
    .where(like(returns.returnNumber, `${prefix}%`)).orderBy(desc(returns.returnNumber)).limit(1);
  const last = r[0]?.num;
  const seq = last ? parseInt(last.split("-").pop() || "0") + 1 : 1;
  return `${prefix}-${String(seq).padStart(4, "0")}`;
}

// ─── REPORTS ───────────────────────────────────────────────────────────────
export async function getDashboardStats() {
  const db = await getDb();
  if (!db) return { todaySales: 0, todayOrders: 0, monthSales: 0, monthOrders: 0, totalCustomers: 0, lowStockCount: 0 };
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const todayRows = await db.execute(sql`SELECT COUNT(*) as cnt, COALESCE(SUM(total),0) as total FROM invoices WHERE status='completed' AND createdAt >= ${todayStart}`) as unknown as any[][];
  const monthRows = await db.execute(sql`SELECT COUNT(*) as cnt, COALESCE(SUM(total),0) as total FROM invoices WHERE status='completed' AND createdAt >= ${monthStart}`) as unknown as any[][];
  const custRows = await db.execute(sql`SELECT COUNT(*) as cnt FROM customers`) as unknown as any[][];
  const lowRows = await db.execute(sql`SELECT COUNT(*) as cnt FROM products p WHERE p.isActive=1 AND (SELECT COALESCE(SUM(qty),0) FROM product_stock WHERE productId=p.id) <= p.lowStockAlert`) as unknown as any[][];

  const today = todayRows[0]?.[0] as any;
  const month = monthRows[0]?.[0] as any;
  const cust = custRows[0]?.[0] as any;
  const low = lowRows[0]?.[0] as any;

  return {
    todaySales: parseFloat(today?.total || "0"),
    todayOrders: parseInt(today?.cnt || "0"),
    monthSales: parseFloat(month?.total || "0"),
    monthOrders: parseInt(month?.cnt || "0"),
    totalCustomers: parseInt(cust?.cnt || "0"),
    lowStockCount: parseInt(low?.cnt || "0"),
  };
}

export async function getTopProducts(limit = 10) {
  const db = await getDb(); if (!db) return [];
  const result = await db.execute(sql`
    SELECT ii.productId, ii.productName, SUM(ii.qty) as totalQty, SUM(ii.lineTotal) as totalRevenue
    FROM invoice_items ii
    JOIN invoices i ON i.id = ii.invoiceId
    WHERE i.status = 'completed'
    GROUP BY ii.productId, ii.productName
    ORDER BY totalRevenue DESC
    LIMIT ${limit}
  `) as unknown as any[][];
  return (result[0] || []) as any[];
}

export async function getMonthlySales(months = 12) {
  const db = await getDb(); if (!db) return [];
  const result = await db.execute(sql`
    SELECT DATE_FORMAT(createdAt, '%Y-%m') as month, COUNT(*) as orders, COALESCE(SUM(total),0) as total
    FROM invoices WHERE status='completed'
    GROUP BY month ORDER BY month DESC LIMIT ${months}
  `) as unknown as any[][];
  return ((result[0] || []) as any[]).reverse();
}

export async function getLowStockProducts() {
  const db = await getDb(); if (!db) return [];
  const result = await db.execute(sql`
    SELECT p.*, COALESCE(SUM(ps.qty),0) as totalQty
    FROM products p
    LEFT JOIN product_stock ps ON ps.productId = p.id
    WHERE p.isActive = 1
    GROUP BY p.id
    HAVING totalQty <= p.lowStockAlert
    ORDER BY totalQty ASC
  `) as unknown as any[][];
  return (result[0] || []) as any[];
}

// ─── CREATE INVOICE FROM PAYMENT REQUEST ─────────────────────────────────────
export async function createInvoiceFromPaymentRequest(pr: any, settings: any): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("DB connection failed");

  // Generate invoice number
  const count = await db.select({ id: invoices.id }).from(invoices);
  const invoiceNumber = `INV-${String(count.length + 1).padStart(6, "0")}`;
  const token = require("crypto").randomBytes(16).toString("hex");

  // Parse cart items
  const cartItems: any[] = JSON.parse(pr.cartJson || "[]");

  // Insert invoice
  const [result] = await db.insert(invoices).values({
    invoiceNumber,
    token,
    customerId: pr.customerId,
    customerName: pr.customerName,
    customerPhone: pr.customerPhone,
    warehouseId: pr.warehouseId,
    cashierId: pr.cashierId,
    subtotal: pr.subtotal,
    discountType: (pr.discountType as any) || "none",
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
    whatsappSent: false,
  } as any);

  const invoiceId = (result as any).insertId;

  // Insert invoice items + update stock
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
      lineTotal: String(item.lineTotal),
    } as any);

    // Deduct stock
    if (item.productId) {
      await addStockMovement({
        productId: item.productId,
        type: "sale",
        qty: -item.qty,
        reference: invoiceNumber,
        warehouseId: pr.warehouseId,
        notes: `فاتورة ${invoiceNumber}`,
      });
    }
  }

  // Update customer stats if applicable
  if (pr.customerId) {
    await updateCustomer(pr.customerId, {
      lastPurchaseAt: new Date(),
    } as any);
  }

  return invoiceId;
}

// ─── PRODUCT COLORS ────────────────────────────────────────────────────────
export async function getColors() {
  const db = await getDb(); if (!db) return [];
  return db.select().from(productColors).where(eq(productColors.isActive, true)).orderBy(productColors.sortOrder, productColors.name);
}

export async function createColor(data: typeof productColors.$inferInsert) {
  const db = await getDb(); if (!db) return;
  await db.insert(productColors).values(data);
}

export async function updateColor(id: number, data: Partial<typeof productColors.$inferInsert>) {
  const db = await getDb(); if (!db) return;
  await db.update(productColors).set(data).where(eq(productColors.id, id));
}

export async function deleteColor(id: number) {
  const db = await getDb(); if (!db) return;
  await db.delete(productColors).where(eq(productColors.id, id));
}

// ─── PRODUCT SIZES ─────────────────────────────────────────────────────────
export async function getSizes() {
  const db = await getDb(); if (!db) return [];
  return db.select().from(productSizes).where(eq(productSizes.isActive, true)).orderBy(productSizes.sortOrder, productSizes.name);
}

export async function createSize(data: typeof productSizes.$inferInsert) {
  const db = await getDb(); if (!db) return;
  await db.insert(productSizes).values(data);
}

export async function updateSize(id: number, data: Partial<typeof productSizes.$inferInsert>) {
  const db = await getDb(); if (!db) return;
  await db.update(productSizes).set(data).where(eq(productSizes.id, id));
}

export async function deleteSize(id: number) {
  const db = await getDb(); if (!db) return;
  await db.delete(productSizes).where(eq(productSizes.id, id));
}
