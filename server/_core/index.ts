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
  app.get("/api/payment-callback", async (req: any, res: any) => {
    try {
      const invoiceId = parseInt(req.query.invoice_id as string);
      const status = req.query.status as string;
      if (!invoiceId || isNaN(invoiceId)) {
        return res.redirect("/invoices?payment=error");
      }
      const { updateInvoice, getInvoiceById, getSettings } = await import("../db");
      const settings = await getSettings();
      if (status === "error") {
        await updateInvoice(invoiceId, { mfStatus: "FAILED", paymentStatus: "pending" });
        return res.redirect(`/invoices?payment=failed&id=${invoiceId}`);
      }
      const inv = await getInvoiceById(invoiceId);
      if (inv && inv.mfInvoiceId && settings?.myfatoorahToken) {
        try {
          const axiosLib = (await import("axios")).default;
          const isLive = settings.myfatoorahEnv === "live";
          const base = isLive ? "https://api.myfatoorah.com" : "https://apitest.myfatoorah.com";
          const mfRes = await axiosLib.post(`${base}/v2/GetPaymentStatus`,
            { Key: inv.mfInvoiceId, KeyType: "InvoiceId" },
            { headers: { Authorization: `Bearer ${settings.myfatoorahToken}`, "Content-Type": "application/json" }, timeout: 10000 }
          );
          const data = mfRes.data?.Data;
          const mfStatus = data?.InvoiceStatus || "";
          const transStatus = data?.InvoiceTransactions?.[0]?.TransactionStatus || "";
          const isPaid = mfStatus === "Paid" || transStatus === "Succss" || transStatus === "Success";
          if (isPaid) {
            await updateInvoice(invoiceId, { paymentStatus: "paid", mfStatus: "CAPTURED" });
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

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
