import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { settings } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

const EVO_BASE = process.env.WHATSAPP_API_BASE || "https://elv.academy-smart.com";
const EVO_APIKEY = process.env.WHATSAPP_API_KEY || "BQYHJGJHJ";

async function evoFetch(path: string, method = "GET", body?: object) {
  const res = await fetch(`${EVO_BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      apikey: EVO_APIKEY,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  try {
    return { ok: res.ok, status: res.status, data: JSON.parse(text) };
  } catch {
    return { ok: res.ok, status: res.status, data: { raw: text } };
  }
}

async function getInstanceName(): Promise<string | null> {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(settings).limit(1);
  return rows[0]?.whatsappInstance || null;
}

async function saveInstanceName(instanceName: string) {
  const db = await getDb();
  if (!db) return;
  const rows = await db.select().from(settings).limit(1);
  if (rows.length > 0) {
    await db.update(settings).set({ whatsappInstance: instanceName }).where(eq(settings.id, rows[0].id));
  } else {
    await db.insert(settings).values({ whatsappInstance: instanceName });
  }
}

async function clearInstanceName() {
  const db = await getDb();
  if (!db) return;
  const rows = await db.select().from(settings).limit(1);
  if (rows.length > 0) {
    await db.update(settings).set({ whatsappInstance: null }).where(eq(settings.id, rows[0].id));
  }
}

export const whatsappRouter = router({
  // جلب الـ instance المحفوظ وحالته
  getStatus: protectedProcedure.query(async () => {
    const instanceName = await getInstanceName();
    if (!instanceName) {
      return { status: "not_configured", instanceName: null, number: null };
    }
    try {
      const res = await evoFetch(`/instance/connectionState/${instanceName}`);
      const state = res.data?.instance?.state || res.data?.state || "disconnected";
      const number = res.data?.instance?.profileName || res.data?.profileName || null;
      if (state === "open") {
        return { status: "connected", instanceName, number };
      } else if (state === "connecting") {
        return { status: "pending", instanceName, number: null };
      } else {
        return { status: "disconnected", instanceName, number: null };
      }
    } catch {
      return { status: "disconnected", instanceName, number: null };
    }
  }),

  // إنشاء instance جديد وجلب QR
  createInstance: protectedProcedure
    .input(z.object({ number: z.string().min(9) }))
    .mutation(async ({ input }) => {
      // حذف الـ instance القديم إذا وجد
      const oldInstance = await getInstanceName();
      if (oldInstance) {
        try {
          await evoFetch(`/instance/delete/${oldInstance}`, "DELETE");
        } catch { /* ignore */ }
      }

      // تنظيف رقم الجوال
      let num = input.number.replace(/[^0-9]/g, "");
      if (num.length === 10 && num.startsWith("0")) num = "966" + num.slice(1);
      else if (num.length === 9) num = "966" + num;

      const instanceName = `darin-${Date.now()}`;

      const res = await evoFetch("/instance/create", "POST", {
        instanceName,
        number: num,
        qrcode: true,
        integration: "WHATSAPP-BAILEYS",
      });

      if (!res.ok && res.status !== 201) {
        throw new Error(res.data?.message || "فشل إنشاء الاتصال");
      }

      await saveInstanceName(instanceName);

      // انتظر ثانيتين ثم جلب QR
      await new Promise((r) => setTimeout(r, 2000));
      const qrRes = await evoFetch(`/instance/connect/${instanceName}`);
      const qrBase64 =
        qrRes.data?.base64 ||
        qrRes.data?.qrcode?.base64 ||
        null;

      return {
        instanceName,
        qrBase64,
        instance: res.data?.instance || res.data,
      };
    }),

  // جلب QR code للـ instance الحالي
  getQR: protectedProcedure.query(async () => {
    const instanceName = await getInstanceName();
    if (!instanceName) throw new Error("لا يوجد instance مُنشأ");

    const res = await evoFetch(`/instance/connect/${instanceName}`);
    const qrBase64 =
      res.data?.base64 ||
      res.data?.qrcode?.base64 ||
      null;

    return { qrBase64, instanceName };
  }),

  // التحقق من حالة الاتصال (للـ polling)
  checkConnection: protectedProcedure.query(async () => {
    const instanceName = await getInstanceName();
    if (!instanceName) return { state: "not_configured" };

    try {
      const res = await evoFetch(`/instance/connectionState/${instanceName}`);
      const state = res.data?.instance?.state || res.data?.state || "disconnected";
      const number = res.data?.instance?.profileName || null;
      return { state, instanceName, number };
    } catch {
      return { state: "disconnected", instanceName, number: null };
    }
  }),

  // قطع الاتصال وحذف الـ instance
  disconnect: protectedProcedure.mutation(async () => {
    const instanceName = await getInstanceName();
    if (instanceName) {
      try {
        await evoFetch(`/instance/delete/${instanceName}`, "DELETE");
      } catch { /* ignore */ }
    }
    await clearInstanceName();
    return { success: true };
  }),

  // إرسال رسالة واتساب
  sendMessage: protectedProcedure
    .input(
      z.object({
        phone: z.string(),
        message: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const instanceName = await getInstanceName();
      if (!instanceName) throw new Error("واتساب غير مُفعَّل");

      let num = input.phone.replace(/[^0-9]/g, "");
      if (num.length === 10 && num.startsWith("0")) num = "966" + num.slice(1);
      else if (num.length === 9) num = "966" + num;

      const res = await evoFetch(`/message/sendText/${instanceName}`, "POST", {
        number: num,
        text: input.message,
      });

      if (!res.ok) {
        throw new Error(res.data?.message || "فشل إرسال الرسالة");
      }

      return { success: true };
    }),
});
