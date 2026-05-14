import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import multer from "multer";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { storagePut } from "../storage";
import { jwtVerify } from "jose";
import { parse as parseCookieHeader } from "cookie";
import { COOKIE_NAME } from "../../shared/const";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  registerStorageProxy(app);

  // Image upload endpoint
  const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
  const getSessionSecret = () => new TextEncoder().encode(process.env.JWT_SECRET || "darin-madani-secret-key-2024");
  app.post("/api/upload", upload.single("file"), async (req: any, res: any) => {
    try {
      const cookieHeader = req.headers.cookie;
      const cookies = cookieHeader ? parseCookieHeader(cookieHeader) : {};
      const token = cookies[COOKIE_NAME];
      if (!token) return res.status(401).json({ error: "Unauthorized" });
      await jwtVerify(token, getSessionSecret(), { algorithms: ["HS256"] });
      if (!req.file) return res.status(400).json({ error: "No file" });
      const ext = req.file.originalname.split(".").pop() || "jpg";
      const key = `products/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
      const { url } = await storagePut(key, req.file.buffer, req.file.mimetype);
      res.json({ url });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // OAuth routes removed - using independent username/password auth

  // MyFatoorah payment callback - called after customer completes payment
  // Supports two flows:
  //   1. token=xxx  → new flow: payment_requests table, creates invoice on success
  //   2. invoice_id=xxx → legacy flow: updates existing invoice
  app.get("/api/payment-callback", async (req: any, res: any) => {
    try {
      const token = req.query.token as string;
      const status = req.query.status as string;

      // ── NEW FLOW: token-based (payment_requests) ──────────────────────────
      if (token) {
        const { getDb } = await import("../db");
        const { paymentRequests } = await import("../../drizzle/schema");
        const { eq } = await import("drizzle-orm");
        const { getSettings, createInvoice: dbCreateInvoice } = await import("../db");
        const db = await getDb();
        if (!db) return res.redirect("/pos?payment=error");

        const rows = await db.select().from(paymentRequests).where(eq(paymentRequests.token, token)).limit(1);
        const pr = rows[0];
        if (!pr) return res.redirect("/pos?payment=error&reason=not_found");

        if (status === "error") {
          await db.update(paymentRequests).set({ status: "failed", mfStatus: "FAILED" }).where(eq(paymentRequests.token, token));
          return res.redirect("/pos?payment=failed");
        }

        // Verify payment with MyFatoorah
        const settings = await getSettings();
        let isPaid = false;
        if (pr.mfInvoiceId && settings?.myfatoorahToken) {
          try {
            const axiosLib = (await import("axios")).default;
            const isLive = settings.myfatoorahEnv === "live";
            const base = isLive ? "https://api.myfatoorah.com" : "https://apitest.myfatoorah.com";
            const mfRes = await axiosLib.post(`${base}/v2/GetPaymentStatus`,
              { Key: pr.mfInvoiceId, KeyType: "InvoiceId" },
              { headers: { Authorization: `Bearer ${settings.myfatoorahToken}`, "Content-Type": "application/json" }, timeout: 10000 }
            );
            const data = mfRes.data?.Data;
            const mfStatus = data?.InvoiceStatus || "";
            const transStatus = data?.InvoiceTransactions?.[0]?.TransactionStatus || "";
            isPaid = mfStatus === "Paid" || transStatus === "Succss" || transStatus === "Success";
          } catch (e: any) {
            console.error("[Callback] MF verify error:", e?.message);
          }
        }

        if (isPaid) {
          // Create invoice from cart snapshot
          try {
            const { createInvoiceFromPaymentRequest } = await import("../db");
            const invoiceId = await createInvoiceFromPaymentRequest(pr, settings);
            // Mark payment request as paid
            await db.update(paymentRequests).set({ status: "paid", mfStatus: "CAPTURED", invoiceId }).where(eq(paymentRequests.token, token));
            // Send WhatsApp with invoice link
            if (pr.customerPhone && settings?.whatsappInstance) {
              try {
                const axiosLib = (await import("axios")).default;
                const base2 = (settings.whatsappApiBase || "").replace(/\/$/, "");
                const formattedPhone = pr.customerPhone.replace(/\D/g, "").replace(/^0/, "966");
                const origin = req.headers.origin || `https://${req.headers.host}`;
                const invoiceLink = `${origin}/invoice/${invoiceId}`;
                const msg = `شكراً لسدادك بنجاح! مرحباً ${pr.customerName || ""}\n\nفاتورتك جاهزة:\n${invoiceLink}`;
                await axiosLib.post(`${base2}/message/sendText/${settings.whatsappInstance}`,
                  { number: `${formattedPhone}@s.whatsapp.net`, text: msg },
                  { headers: { apikey: settings.whatsappApiKey || "" }, timeout: 10000 }
                );
              } catch (e: any) {
                console.error("[Callback] WhatsApp send error:", e?.message);
              }
            }
            return res.redirect(`/invoices?payment=success&id=${invoiceId}`);
          } catch (e: any) {
            console.error("[Callback] Invoice creation error:", e?.message);
            return res.redirect("/pos?payment=error&reason=invoice_failed");
          }
        }

        return res.redirect("/pos?payment=pending");
      }

      // ── LEGACY FLOW: invoice_id-based ─────────────────────────────────────
      const invoiceId = parseInt(req.query.invoice_id as string);
      if (!invoiceId || isNaN(invoiceId)) {
        return res.redirect("/invoices?payment=error");
      }
      const { updateInvoice, getInvoiceById, getSettings: getSettingsLegacy } = await import("../db");
      const settingsLegacy = await getSettingsLegacy();
      if (status === "error") {
        await updateInvoice(invoiceId, { mfStatus: "FAILED", paymentStatus: "pending" } as any);
        return res.redirect(`/invoices?payment=failed&id=${invoiceId}`);
      }
      const inv = await getInvoiceById(invoiceId);
      if (inv && inv.mfInvoiceId && settingsLegacy?.myfatoorahToken) {
        try {
          const axiosLib = (await import("axios")).default;
          const isLive = settingsLegacy.myfatoorahEnv === "live";
          const base = isLive ? "https://api.myfatoorah.com" : "https://apitest.myfatoorah.com";
          const mfRes = await axiosLib.post(`${base}/v2/GetPaymentStatus`,
            { Key: inv.mfInvoiceId, KeyType: "InvoiceId" },
            { headers: { Authorization: `Bearer ${settingsLegacy.myfatoorahToken}`, "Content-Type": "application/json" }, timeout: 10000 }
          );
          const data = mfRes.data?.Data;
          const mfStatus = data?.InvoiceStatus || "";
          const transStatus = data?.InvoiceTransactions?.[0]?.TransactionStatus || "";
          const isPaidLegacy = mfStatus === "Paid" || transStatus === "Succss" || transStatus === "Success";
          if (isPaidLegacy) {
            await updateInvoice(invoiceId, { paymentStatus: "paid", mfStatus: "CAPTURED" } as any);
            return res.redirect(`/invoices?payment=success&id=${invoiceId}`);
          }
        } catch (e: any) {
          console.error("[Callback] MF verify error:", e?.message);
        }
      }
      return res.redirect(`/invoices?payment=pending&id=${invoiceId}`);
    } catch (e: any) {
      console.error("[Callback] Error:", e?.message);
      res.redirect("/invoices?payment=error");
    }
  });

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // IISNode on Windows provides PORT as a named pipe (e.g. \\.\pipe\...) not a number
  // We must use it directly without parseInt
  const rawPort = process.env.PORT;
  const isNamedPipe = rawPort && isNaN(Number(rawPort));

  if (isNamedPipe) {
    // IISNode named pipe - listen directly
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
