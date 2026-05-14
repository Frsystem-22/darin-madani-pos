import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  getProducts, getProductById, getProductByBarcode, createProduct,
  updateProduct, deleteProduct, getProductStock, upsertProductStock,
  setProductStock, addStockMovement, getStockMovements, getWarehouses,
  reserveBarcodeSerials, getLastBarcodeSerial, getProductVariants,
} from "../db";
import { protectedProcedure, router } from "../_core/trpc";
import { nanoid } from "nanoid";

const adminOrManager = protectedProcedure.use(({ ctx, next }) => {
  if (!["admin", "manager", "warehouse"].includes(ctx.user.role))
    throw new TRPCError({ code: "FORBIDDEN" });
  return next({ ctx });
});

export const productsRouter = router({
  list: protectedProcedure.input(z.object({
    search: z.string().optional(),
    categoryId: z.number().optional(),
    warehouseId: z.number().optional(),
    lowStock: z.boolean().optional(),
  }).optional()).query(async ({ input }) => {
    return await getProducts(input);
  }),

  get: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
    const p = await getProductById(input.id);
    if (!p) throw new TRPCError({ code: "NOT_FOUND" });
    return p;
  }),

  getByBarcode: protectedProcedure.input(z.object({ barcode: z.string() })).query(async ({ input }) => {
    const p = await getProductByBarcode(input.barcode);
    if (!p) throw new TRPCError({ code: "NOT_FOUND", message: "Product not found" });
    return p;
  }),

  create: adminOrManager.input(z.object({
    name: z.string().min(1),
    nameEn: z.string().optional(),
    description: z.string().optional(),
    descriptionEn: z.string().optional(),
    categoryId: z.number().optional(),
    color: z.string().optional(),
    colorEn: z.string().optional(),
    colorHex: z.string().optional(),
    size: z.string().optional(),
    costPrice: z.string().optional(),
    salePrice: z.string(),
    images: z.array(z.string()).optional(),
    lowStockAlert: z.number().optional(),
    sku: z.string().optional(),
    // Initial stock per warehouse
    initialStock: z.array(z.object({ warehouseId: z.number(), qty: z.number() })).optional(),
  })).mutation(async ({ input, ctx }) => {
    const { initialStock, ...productData } = input;
    // Generate barcode if not provided
    const barcode = `DM${Date.now()}${Math.floor(Math.random() * 100)}`;
    const sku = productData.sku || `SKU-${nanoid(8).toUpperCase()}`;
    const id = await createProduct({ ...productData, barcode, sku, images: productData.images || [] } as any);
    if (!id) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    // Set initial stock
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

  update: adminOrManager.input(z.object({
    id: z.number(),
    name: z.string().optional(),
    nameEn: z.string().optional(),
    description: z.string().optional(),
    descriptionEn: z.string().optional(),
    categoryId: z.number().optional().nullable(),
    color: z.string().optional(),
    colorEn: z.string().optional(),
    colorHex: z.string().optional(),
    size: z.string().optional(),
    costPrice: z.string().optional(),
    salePrice: z.string().optional(),
    images: z.array(z.string()).optional(),
    lowStockAlert: z.number().optional(),
    isActive: z.boolean().optional(),
  })).mutation(async ({ input: { id, ...data } }) => {
    await updateProduct(id, data as any);
    return { success: true };
  }),

  delete: adminOrManager.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    await deleteProduct(input.id);
    return { success: true };
  }),

  // Stock management
  getStock: protectedProcedure.input(z.object({
    productId: z.number().optional(),
    warehouseId: z.number().optional(),
  })).query(async ({ input }) => {
    if (input.productId) return await getProductStock(input.productId, input.warehouseId);
    return [];
  }),

  addPurchase: adminOrManager.input(z.object({
    productId: z.number(),
    warehouseId: z.number(),
    qty: z.number().min(1),
    costPrice: z.string().optional(),
    notes: z.string().optional(),
    reference: z.string().optional(),
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
      userId: ctx.user.id,
    });
    return { success: true };
  }),

  transferStock: adminOrManager.input(z.object({
    productId: z.number(),
    fromWarehouseId: z.number(),
    toWarehouseId: z.number(),
    qty: z.number().min(1),
    notes: z.string().optional(),
  })).mutation(async ({ input, ctx }) => {
    const fromStock = await getProductStock(input.productId, input.fromWarehouseId);
    const available = fromStock[0]?.qty || 0;
    if (available < input.qty) throw new TRPCError({ code: "BAD_REQUEST", message: "Insufficient stock" });
    await upsertProductStock(input.productId, input.fromWarehouseId, -input.qty);
    await upsertProductStock(input.productId, input.toWarehouseId, input.qty);
    await addStockMovement({
      productId: input.productId,
      warehouseId: input.fromWarehouseId,
      toWarehouseId: input.toWarehouseId,
      type: "transfer",
      qty: input.qty,
      notes: input.notes,
      userId: ctx.user.id,
    });
    return { success: true };
  }),

  adjustStock: adminOrManager.input(z.object({
    productId: z.number(),
    warehouseId: z.number(),
    newQty: z.number().min(0),
    notes: z.string().optional(),
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
      userId: ctx.user.id,
    });
    return { success: true };
  }),

  getMovements: protectedProcedure.input(z.object({
    productId: z.number().optional(),
    warehouseId: z.number().optional(),
  })).query(async ({ input }) => {
    return await getStockMovements(input.productId, input.warehouseId);
  }),

  // ─── BARCODE SERIALS ─────────────────────────────────────────────────────────────
  /**
   * Reserve N sequential serial numbers for a variant barcode.
   * Returns array of serial numbers to print on labels.
   */
  reserveSerials: adminOrManager.input(z.object({
    variantBarcode: z.string().min(1),
    qty: z.number().min(1).max(500),
  })).mutation(async ({ input }) => {
    const serials = await reserveBarcodeSerials(input.variantBarcode, input.qty);
    return { serials, variantBarcode: input.variantBarcode };
  }),

  /**
   * Get the last allocated serial for a variant barcode (for preview).
   */
  getLastSerial: protectedProcedure.input(z.object({
    variantBarcode: z.string().min(1),
  })).query(async ({ input }) => {
    const lastSerial = await getLastBarcodeSerial(input.variantBarcode);
    return { lastSerial, variantBarcode: input.variantBarcode };
  }),

  // ─── PRODUCT VARIANTS ─────────────────────────────────────────────────────────────
  /**
   * Get all variants of a product (same name, different color/size)
   * with stock per warehouse.
   */
  getVariants: protectedProcedure.input(z.object({
    productId: z.number(),
  })).query(async ({ input }) => {
    return await getProductVariants(input.productId);
  }),
});
