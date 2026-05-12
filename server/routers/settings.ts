import { z } from "zod";
import { getSettings, updateSettings, getWarehouses, createWarehouse, updateWarehouse, deleteWarehouse, getCategories, createCategory, updateCategory, deleteCategory, getDiscounts, createDiscount, updateDiscount, deleteDiscount } from "../db";
import { protectedProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";

const adminOnly = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin" && ctx.user.role !== "manager") throw new TRPCError({ code: "FORBIDDEN" });
  return next({ ctx });
});

export const settingsRouter = router({
  get: protectedProcedure.query(async () => {
    return await getSettings();
  }),

  update: adminOnly.input(z.object({
    storeName: z.string().optional(),
    storeNameEn: z.string().optional(),
    storePhone: z.string().optional(),
    storeEmail: z.string().optional(),
    storeAddress: z.string().optional(),
    storeAddressEn: z.string().optional(),
    storeLogo: z.string().optional(),
    taxNumber: z.string().optional(),
    taxRate: z.string().optional(),
    currency: z.string().optional(),
    currencySymbol: z.string().optional(),
    invoiceNote: z.string().optional(),
    invoiceNoteEn: z.string().optional(),
    whatsappEnabled: z.boolean().optional(),
    whatsappInstance: z.string().optional(),
    whatsappApiKey: z.string().optional(),
    whatsappApiBase: z.string().optional(),
    whatsappTemplate: z.string().optional(),
    myfatoorahEnabled: z.boolean().optional(),
    myfatoorahToken: z.string().optional(),
    myfatoorahEnv: z.enum(["sandbox", "live"]).optional(),
    myfatoorahSupplier: z.string().optional(), // ثابت = 24 لـ Darin Madani
    priceIncludesTax: z.boolean().optional(),
  })).mutation(async ({ input }) => {
    await updateSettings(input as any);
    return { success: true };
  }),

  // Warehouses
  getWarehouses: protectedProcedure.query(async () => {
    return await getWarehouses(false);
  }),

  createWarehouse: adminOnly.input(z.object({
    name: z.string().min(1),
    nameEn: z.string().optional(),
    description: z.string().optional(),
    isDefault: z.boolean().optional(),
    isActive: z.boolean().optional(),
  })).mutation(async ({ input }) => {
    await createWarehouse(input as any);
    return { success: true };
  }),

  updateWarehouse: adminOnly.input(z.object({
    id: z.number(),
    name: z.string().optional(),
    nameEn: z.string().optional(),
    description: z.string().optional(),
    isDefault: z.boolean().optional(),
    isActive: z.boolean().optional(),
  })).mutation(async ({ input: { id, ...data } }) => {
    await updateWarehouse(id, data as any);
    return { success: true };
  }),

  deleteWarehouse: adminOnly.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    await deleteWarehouse(input.id);
    return { success: true };
  }),

  // Categories
  getCategories: protectedProcedure.query(async () => {
    return await getCategories();
  }),

  createCategory: adminOnly.input(z.object({
    name: z.string().min(1),
    nameEn: z.string().optional(),
    parentId: z.number().optional(),
    sortOrder: z.number().optional(),
  })).mutation(async ({ input }) => {
    await createCategory(input as any);
    return { success: true };
  }),

  updateCategory: adminOnly.input(z.object({
    id: z.number(),
    name: z.string().optional(),
    nameEn: z.string().optional(),
    sortOrder: z.number().optional(),
    isActive: z.boolean().optional(),
  })).mutation(async ({ input: { id, ...data } }) => {
    await updateCategory(id, data as any);
    return { success: true };
  }),

  deleteCategory: adminOnly.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    await deleteCategory(input.id);
    return { success: true };
  }),

  // Discounts
  getDiscounts: protectedProcedure.query(async () => {
    return await getDiscounts(false);
  }),

  createDiscount: adminOnly.input(z.object({
    name: z.string().min(1),
    nameEn: z.string().optional(),
    type: z.enum(["percentage", "fixed"]),
    value: z.string(),
    minPurchase: z.string().optional(),
    maxUses: z.number().optional(),
    isActive: z.boolean().optional(),
    startDate: z.date().optional(),
    endDate: z.date().optional(),
  })).mutation(async ({ input }) => {
    await createDiscount(input as any);
    return { success: true };
  }),

  updateDiscount: adminOnly.input(z.object({
    id: z.number(),
    name: z.string().optional(),
    nameEn: z.string().optional(),
    type: z.enum(["percentage", "fixed"]).optional(),
    value: z.string().optional(),
    minPurchase: z.string().optional(),
    maxUses: z.number().optional(),
    isActive: z.boolean().optional(),
    startDate: z.date().optional(),
    endDate: z.date().optional(),
  })).mutation(async ({ input: { id, ...data } }) => {
    await updateDiscount(id, data as any);
    return { success: true };
  }),

  deleteDiscount: adminOnly.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    await deleteDiscount(input.id);
    return { success: true };
  }),
});
