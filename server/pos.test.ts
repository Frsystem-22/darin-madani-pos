import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createAdminCtx(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "admin-test",
      email: "admin@darinmadani.com",
      name: "Admin User",
      loginMethod: "local",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as unknown as TrpcContext["res"],
  };
}

function createCashierCtx(): TrpcContext {
  return {
    user: {
      id: 2,
      openId: "cashier-test",
      email: "cashier@darinmadani.com",
      name: "Cashier User",
      loginMethod: "local",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as unknown as TrpcContext["res"],
  };
}

describe("auth.logout", () => {
  it("clears session cookie and returns success", async () => {
    const cleared: string[] = [];
    const ctx = createAdminCtx();
    ctx.res = { clearCookie: (name: string) => cleared.push(name) } as unknown as TrpcContext["res"];
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result).toEqual({ success: true });
    expect(cleared.length).toBe(1);
  });
});

describe("auth.me", () => {
  it("returns the current user for admin", async () => {
    const caller = appRouter.createCaller(createAdminCtx());
    const user = await caller.auth.me();
    expect(user).not.toBeNull();
    expect(user?.role).toBe("admin");
  });

  it("returns the current user for cashier", async () => {
    const caller = appRouter.createCaller(createCashierCtx());
    const user = await caller.auth.me();
    expect(user?.role).toBe("user");
  });
});

describe("settings router", () => {
  it("blocks non-admin from updating settings", async () => {
    const caller = appRouter.createCaller(createCashierCtx());
    await expect(
      caller.settings.update({ storeName: "Test" })
    ).rejects.toThrow();
  });
});

describe("users router", () => {
  it("blocks non-admin from listing users", async () => {
    const caller = appRouter.createCaller(createCashierCtx());
    await expect(caller.users.list()).rejects.toThrow();
  });
});
