import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getCustomers, getCustomerById, createCustomer, updateCustomer, deleteCustomer, getInvoices, getDiscounts, createDiscount, updateDiscount, deleteDiscount } from "../db";
import { protectedProcedure, router } from "../_core/trpc";

export const customersRouter = router({
  list: protectedProcedure.input(z.object({ search: z.string().optional() }).optional()).query(async ({ input }) => {
    return await getCustomers(input?.search);
  }),

  get: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
    const c = await getCustomerById(input.id);
    if (!c) throw new TRPCError({ code: "NOT_FOUND" });
    const invoiceList = await getInvoices({ customerId: input.id });
    return { ...c, invoices: invoiceList };
  }),

  create: protectedProcedure.input(z.object({
    name: z.string().min(1),
    phone: z.string().optional(),
    email: z.string().optional(),
    city: z.string().optional(),
    address: z.string().optional(),
    notes: z.string().optional(),
  })).mutation(async ({ input }) => {
    const id = await createCustomer(input as any);
    return { success: true, id };
  }),

  update: protectedProcedure.input(z.object({
    id: z.number(),
    name: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().optional(),
    city: z.string().optional(),
    address: z.string().optional(),
    notes: z.string().optional(),
  })).mutation(async ({ input: { id, ...data } }) => {
    await updateCustomer(id, data as any);
    return { success: true };
  }),

  delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    await deleteCustomer(input.id);
    return { success: true };
  }),

  // Discounts
  listDiscounts: protectedProcedure.input(z.object({ activeOnly: z.boolean().optional() }).optional()).query(async ({ input }) => {
    return await getDiscounts(input?.activeOnly);
  }),

  createDiscount: protectedProcedure.input(z.object({
    name: z.string().min(1),
    nameEn: z.string().optional(),
    type: z.enum(["percentage", "fixed"]),
    value: z.string(),
    minAmount: z.string().optional(),
    maxUses: z.number().optional(),
    isActive: z.boolean().optional(),
    startDate: z.date().optional(),
    endDate: z.date().optional(),
  })).mutation(async ({ input }) => {
    const id = await createDiscount(input as any);
    return { success: true, id };
  }),

  updateDiscount: protectedProcedure.input(z.object({
    id: z.number(),
    name: z.string().optional(),
    nameEn: z.string().optional(),
    type: z.enum(["percentage", "fixed"]).optional(),
    value: z.string().optional(),
    minAmount: z.string().optional(),
    maxUses: z.number().optional(),
    isActive: z.boolean().optional(),
    startDate: z.date().optional(),
    endDate: z.date().optional(),
  })).mutation(async ({ input: { id, ...data } }) => {
    await updateDiscount(id, data as any);
    return { success: true };
  }),

  deleteDiscount: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    await deleteDiscount(input.id);
    return { success: true };
  }),
});
