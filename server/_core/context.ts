import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { jwtVerify } from "jose";
import { parse as parseCookieHeader } from "cookie";
import { COOKIE_NAME } from "@shared/const";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

function getSessionSecret() {
  const secret = process.env.JWT_SECRET || "darin-madani-secret-key-2024";
  return new TextEncoder().encode(secret);
}

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    const cookieHeader = opts.req.headers.cookie;
    const cookies = cookieHeader ? parseCookieHeader(cookieHeader) : {};
    const token = cookies[COOKIE_NAME];

    if (token) {
      const secretKey = getSessionSecret();
      const { payload } = await jwtVerify(token, secretKey, { algorithms: ["HS256"] });
      const userId = payload.userId as number;
      if (userId) {
        const { getUserById } = await import("../db");
        user = (await getUserById(userId)) ?? null;
      }
    }
  } catch {
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
