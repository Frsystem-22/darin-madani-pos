import { TRPCError } from "@trpc/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getUserByUsername, getUserById, updateUser } from "../db";
import { getSessionCookieOptions } from "../_core/cookies";
import { COOKIE_NAME } from "@shared/const";

const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

function getSessionSecret() {
  const secret = process.env.JWT_SECRET || "darin-madani-secret-key-2024";
  return new TextEncoder().encode(secret);
}

async function signJWT(userId: number): Promise<string> {
  const secretKey = getSessionSecret();
  const expiresAt = Math.floor((Date.now() + ONE_YEAR_MS) / 1000);
  return new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setExpirationTime(expiresAt)
    .sign(secretKey);
}

export const authRouter = router({
  me: publicProcedure.query(({ ctx }) => ctx.user ?? null),

  login: publicProcedure.input(z.object({
    username: z.string().min(1),
    password: z.string().min(1),
  })).mutation(async ({ input, ctx }) => {
    const user = await getUserByUsername(input.username);
    if (!user) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "اسم المستخدم أو كلمة المرور غير صحيحة" });
    }
    if (!user.isActive) {
      throw new TRPCError({ code: "FORBIDDEN", message: "الحساب موقوف. تواصل مع المدير" });
    }
    if (!user.passwordHash) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "لم يتم تعيين كلمة مرور لهذا الحساب" });
    }
    const valid = await bcrypt.compare(input.password, user.passwordHash);
    if (!valid) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "اسم المستخدم أو كلمة المرور غير صحيحة" });
    }

    const token = await signJWT(user.id);
    const cookieOptions = getSessionCookieOptions(ctx.req);
    ctx.res.cookie(COOKIE_NAME, token, {
      ...cookieOptions,
      maxAge: ONE_YEAR_MS,
    });

    // Update last signed in
    await updateUser(user.id, { lastSignedIn: new Date() });

    const { passwordHash: _, ...safeUser } = user;
    return { success: true, user: safeUser };
  }),

  logout: publicProcedure.mutation(({ ctx }) => {
    const cookieOptions = getSessionCookieOptions(ctx.req);
    ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    return { success: true } as const;
  }),

  changePassword: protectedProcedure.input(z.object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(6),
  })).mutation(async ({ input, ctx }) => {
    const user = await getUserById(ctx.user.id);
    if (!user?.passwordHash) throw new TRPCError({ code: "BAD_REQUEST" });
    const valid = await bcrypt.compare(input.currentPassword, user.passwordHash);
    if (!valid) throw new TRPCError({ code: "UNAUTHORIZED", message: "كلمة المرور الحالية غير صحيحة" });
    const newHash = await bcrypt.hash(input.newPassword, 12);
    await updateUser(ctx.user.id, { passwordHash: newHash });
    return { success: true };
  }),
});
