// Load .env from multiple possible locations
import dotenv from "dotenv";
import path from "path";
// Try parent of dist/ first (httpdocs/.env), then dist/.env, then cwd
dotenv.config({ path: path.resolve(__dirname, "..", ".env") });
dotenv.config({ path: path.resolve(__dirname, ".env") });
dotenv.config(); // fallback

import express from "express";
import { createServer } from "http";
import multer from "multer";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { storagePut } from "../storage";
import fs from "fs";
import bcrypt from "bcryptjs";
import { getDb } from "../db";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

// Production static file serving (no vite)
function serveStatic(app: express.Express) {
  // In iisnode: __dirname = C:\Inetpub\vhosts\dm-fash.com\httpdocs\dist
  // So "public" subfolder = dist/public
  const distPath = path.resolve(__dirname, "public");
  if (!fs.existsSync(distPath)) {
    console.error(`Could not find build directory: ${distPath}`);
  } else {
    console.log(`Serving static files from: ${distPath}`);
  }
  app.use(express.static(distPath));
  app.use("*", (_req, res) => {
    const indexPath = path.resolve(distPath, "index.html");
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).send("App not built. index.html not found at: " + indexPath);
    }
  });
}

async function main() {
  const app = express();
  const server = createServer(app);

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // Multer for file uploads
  const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

  // Storage proxy
  registerStorageProxy(app);

  // File upload endpoint
  app.post("/api/upload", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ error: "No file uploaded" });
      const ext = req.file.originalname.split(".").pop() || "bin";
      const key = `uploads/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { url } = await storagePut(key, req.file.buffer, req.file.mimetype);
      res.json({ url, key });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Debug endpoint - shows env vars and paths
  app.get("/api/debug-env", (_req, res) => {
    res.json({
      cwd: process.cwd(),
      dirname: __dirname,
      DATABASE_URL: process.env.DATABASE_URL ? "SET (length=" + process.env.DATABASE_URL.length + ")" : "NOT SET",
      JWT_SECRET: process.env.JWT_SECRET ? "SET" : "NOT SET",
      NODE_ENV: process.env.NODE_ENV,
      envPaths: [
        path.resolve(__dirname, "..", ".env"),
        path.resolve(__dirname, ".env"),
      ].map(p => ({ path: p, exists: fs.existsSync(p) }))
    });
  });

  // Setup endpoint - creates admin user if not exists
  app.get("/api/setup-admin", async (req, res) => {
    try {
      const db = await getDb();
      if (!db) {
        res.status(200).json({ 
          error: "Database not available", 
          env: !!process.env.DATABASE_URL,
          DATABASE_URL_preview: process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 30) + "..." : "NOT SET",
          cwd: process.cwd(),
          dirname: __dirname
        });
        return;
      }
      const existing = await db.select().from(users).where(eq(users.username, "admin")).limit(1);
      if (existing.length > 0) {
        res.status(200).json({ message: "Admin already exists", username: existing[0].username });
        return;
      }
      const passwordHash = await bcrypt.hash("admin123", 12);
      await db.insert(users).values({
        openId: `local-admin-${Date.now()}`,
        username: "admin",
        name: "مدير النظام",
        nameEn: "System Admin",
        passwordHash,
        role: "admin",
        loginMethod: "local",
        isActive: true,
      });
      res.status(200).json({ success: true, message: "Admin user created", username: "admin", password: "admin123" });
    } catch (e: any) {
      res.status(200).json({ error: String(e.message), code: e.code, stack: String(e.stack).split("\n").slice(0,8) });
    }
  });

  // tRPC
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  // Static files (production)
  serveStatic(app);

  // iisnode sets process.env.PORT to a named pipe like \\.\pipe\...
  const listenTarget: any = process.env.PORT || 3000;
  
  server.listen(listenTarget, () => {
    console.log(`Server running on: ${listenTarget}`);
  });
}

main().catch(console.error);
