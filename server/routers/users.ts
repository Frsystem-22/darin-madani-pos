import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getAllUsers, getUserById, updateUser, deleteUser, getUserPermissions, setUserPermissions, upsertUser, getDashboardStats, getTopProducts, getMonthlySales, getLowStockProducts } from "../db";
import { protectedProcedure, router } from "../_core/trpc";
import bcrypt from "bcryptjs";

const adminOnly = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
  return next({ ctx });
});

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export const usersRouter = router({
  list: adminOnly.query(async () => {
    const users = await getAllUsers();
    return users.map(u => ({ ...u, passwordHash: undefined }));
  }),

  get: adminOnly.input(z.object({ id: z.number() })).query(async ({ input }) => {
    const u = await getUserById(input.id);
    if (!u) throw new TRPCError({ code: "NOT_FOUND" });
    const permissions = await getUserPermissions(u.id);
    return { ...u, passwordHash: undefined, permissions };
  }),

  create: adminOnly.input(z.object({
    username: z.string().min(3),
    password: z.string().min(4),
    name: z.string().min(1),
    nameEn: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
    role: z.enum(["admin", "manager", "cashier", "warehouse"]),
    isActive: z.boolean().optional(),
    language: z.enum(["ar", "en"]).optional(),
    permissions: z.array(z.object({
      module: z.string(),
      action: z.string(),
      allowed: z.boolean(),
    })).optional(),
  })).mutation(async ({ input }) => {
    const { password, permissions, ...userData } = input;
    const openId = `local_${input.username}_${Date.now()}`;
    await upsertUser({
      ...userData,
      openId,
      passwordHash: await hashPassword(password),
      loginMethod: "local",
      isActive: input.isActive !== false,
    } as any);
    const users = await getAllUsers();
    const newUser = users.find(u => u.username === input.username);
    if (newUser && permissions?.length) {
      await setUserPermissions(newUser.id, permissions);
    }
    return { success: true };
  }),

  update: adminOnly.input(z.object({
    id: z.number(),
    name: z.string().optional(),
    nameEn: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
    role: z.enum(["admin", "manager", "cashier", "warehouse"]).optional(),
    isActive: z.boolean().optional(),
    language: z.enum(["ar", "en"]).optional(),
    password: z.string().optional(),
    permissions: z.array(z.object({
      module: z.string(),
      action: z.string(),
      allowed: z.boolean(),
    })).optional(),
  })).mutation(async ({ input: { id, password, permissions, ...data } }) => {
    const updateData: any = { ...data };
    if (password) updateData.passwordHash = await hashPassword(password);
    await updateUser(id, updateData);
    if (permissions) await setUserPermissions(id, permissions);
    return { success: true };
  }),

  delete: adminOnly.input(z.object({ id: z.number() })).mutation(async ({ input, ctx }) => {
    if (input.id === ctx.user.id) throw new TRPCError({ code: "BAD_REQUEST", message: "Cannot delete yourself" });
    await deleteUser(input.id);
    return { success: true };
  }),

  getPermissions: adminOnly.input(z.object({ userId: z.number() })).query(async ({ input }) => {
    return await getUserPermissions(input.userId);
  }),

  setPermissions: adminOnly.input(z.object({
    userId: z.number(),
    permissions: z.array(z.object({
      module: z.string(),
      action: z.string(),
      allowed: z.boolean(),
    })),
  })).mutation(async ({ input }) => {
    await setUserPermissions(input.userId, input.permissions);
    return { success: true };
  }),

  // Reports
  dashboardStats: protectedProcedure.query(async () => {
    return await getDashboardStats();
  }),

  topProducts: protectedProcedure.input(z.object({ limit: z.number().optional() }).optional()).query(async ({ input }) => {
    return await getTopProducts(input?.limit);
  }),

  monthlySales: protectedProcedure.input(z.object({ months: z.number().optional() }).optional()).query(async ({ input }) => {
    return await getMonthlySales(input?.months);
  }),

  lowStockProducts: protectedProcedure.query(async () => {
    return await getLowStockProducts();
  }),

  // Current user profile
  updateProfile: protectedProcedure.input(z.object({
    name: z.string().optional(),
    language: z.enum(["ar", "en"]).optional(),
    phone: z.string().optional(),
  })).mutation(async ({ input, ctx }) => {
    await updateUser(ctx.user.id, input as any);
    return { success: true };
  }),
});
