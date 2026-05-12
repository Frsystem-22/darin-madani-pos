/**
 * payment.ts - Online payment flow (MyFatoorah)
 *
 * Flow:
 * 1. Cashier selects "electronic" in POS → calls createPaymentRequest
 *    → stores cart snapshot in payment_requests table
 *    → calls MyFatoorah SendPayment → returns QR + PaymentURL
 *    → NO invoice created yet
 *
 * 2. QR is shown on screen + sent to customer via WhatsApp
 *
 * 3. Customer pays → MyFatoorah calls /api/payment-callback?token=xxx
 *    → callback creates invoice from cart snapshot
 *    → sends invoice link to customer via WhatsApp
 *    → POS polling detects status=paid → shows success + clears cart
 */

import { z } from "zod";import { protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { paymentRequests } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { getSettings } from "../db";
import crypto from "crypto";

// ─── MyFatoorah helper ────────────────────────────────────────────────────────
async function sendMFPayment(opts: {
  amount: number;
  customerName: string;
  customerPhone: string;
  token: string;
  origin: string;
  settings: any;
}) {
  const { amount, customerName, customerPhone, token, origin, settings } = opts;
  const axiosLib = (await import("axios")).default;
  const isLive = settings.myfatoorahEnv === "live";
  const base = isLive ? "https://api.myfatoorah.com" : "https://apitest.myfatoorah.com";
  const callbackUrl = `${origin}/api/payment-callback?token=${token}`;

  const body = {
    NotificationOption: "LNK",
    InvoiceValue: amount,
    CustomerName: customerName || "عميل",
    CustomerMobile: customerPhone || "",
    Language: "AR",
    CallBackUrl: callbackUrl,
    ErrorUrl: `${origin}/api/payment-callback?token=${token}&status=error`,
    DisplayCurrencyIso: "SAR",
    SupplierCode: parseInt(settings.myfatoorahSupplier || "24"),
    InvoiceItems: [{ ItemName: "طلب دفع", Quantity: 1, UnitPrice: amount }],
  };

  const res = await axiosLib.post(`${base}/v2/SendPayment`, body, {
    headers: {
      Authorization: `Bearer ${settings.myfatoorahToken}`,
      "Content-Type": "application/json",
    },
    timeout: 15000,
  });

  const data = res.data?.Data;
  return {
    mfInvoiceId: String(data?.InvoiceId || ""),
    paymentUrl: data?.InvoiceURL || "",
    qrCode: data?.QrCodeUrl || "",
  };
}

// ─── WhatsApp helper ──────────────────────────────────────────────────────────
async function sendWhatsAppMessage(phone: string, message: string, settings: any) {
  if (!settings?.whatsappInstance || !settings?.whatsappApiBase) return false;
  try {
    const axiosLib = (await import("axios")).default;
    const base = settings.whatsappApiBase.replace(/\/$/, "");
    const apiKey = settings.whatsappApiKey || "";
    const formattedPhone = phone.replace(/\D/g, "").replace(/^0/, "966");
    await axiosLib.post(
      `${base}/message/sendText/${settings.whatsappInstance}`,
      { number: `${formattedPhone}@s.whatsapp.net`, text: message },
      { headers: { apikey: apiKey }, timeout: 10000 }
    );
    return true;
  } catch (e: any) {
    console.error("[WhatsApp] send error:", e?.message);
    return false;
  }
}

// ─── Router ───────────────────────────────────────────────────────────────────
export const paymentRouter = {
  /**
   * createPaymentRequest
   * Called from POS when cashier selects "electronic" payment.
   * Stores cart snapshot, calls MyFatoorah, returns QR + PaymentURL.
   * Does NOT create an invoice.
   */
  createPaymentRequest: protectedProcedure
    .input(
      z.object({
        // Cart totals
        subtotal: z.number(),
        discountAmount: z.number().default(0),
        discountType: z.string().optional(),
        discountValue: z.number().optional(),
        discountId: z.number().optional(),
        taxRate: z.number().default(0),
        taxAmount: z.number().default(0),
        total: z.number(),
        // Customer
        customerId: z.number().optional(),
        customerName: z.string().optional(),
        customerPhone: z.string().optional(),
        warehouseId: z.number().optional(),
        notes: z.string().optional(),
        // Cart items (JSON)
        cartJson: z.string(),
        // Origin for callback URL
        origin: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const settings = await getSettings();
      if (!settings?.myfatoorahToken) {
        throw new Error("MyFatoorah غير مفعّل - يرجى إدخال الـ Token في الإعدادات");
      }

      const db = await getDb();
      if (!db) throw new Error("DB connection failed");

      // Generate unique token for this payment request
      const token = crypto.randomBytes(24).toString("hex");

      // Call MyFatoorah
      const mfData = await sendMFPayment({
        amount: input.total,
        customerName: input.customerName || "عميل",
        customerPhone: input.customerPhone || "",
        token,
        origin: input.origin,
        settings,
      });

      // Store payment request in DB
      await db.insert(paymentRequests).values({
        token,
        cartJson: input.cartJson,
        customerId: input.customerId,
        customerName: input.customerName,
        customerPhone: input.customerPhone,
        warehouseId: input.warehouseId,
        cashierId: ctx.user.id,
        subtotal: String(input.subtotal),
        discountAmount: String(input.discountAmount),
        discountType: input.discountType,
        discountValue: String(input.discountValue || 0),
        discountId: input.discountId,
        taxRate: String(input.taxRate),
        taxAmount: String(input.taxAmount),
        total: String(input.total),
        notes: input.notes,
        mfInvoiceId: mfData.mfInvoiceId,
        mfPaymentUrl: mfData.paymentUrl,
        mfQrCode: mfData.qrCode,
        mfStatus: "pending",
        status: "pending",
      } as any);

      // Send WhatsApp to customer if phone available
      if (input.customerPhone && settings.whatsappInstance) {
        const msg = `مرحباً ${input.customerName || ""}،\n\nيرجى إتمام الدفع عبر الرابط التالي:\n${mfData.paymentUrl}\n\nالمبلغ: ${input.total.toFixed(2)} ر.س`;
        await sendWhatsAppMessage(input.customerPhone, msg, settings);
      }

      return {
        token,
        paymentUrl: mfData.paymentUrl,
        qrCode: mfData.qrCode,
      };
    }),

  /**
   * checkPaymentRequest
   * Polling from POS every 5 seconds to check if customer paid.
   */
  checkPaymentRequest: protectedProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { status: "pending", invoiceId: null };

      const rows = await db
        .select()
        .from(paymentRequests)
        .where(eq(paymentRequests.token, input.token))
        .limit(1);

      const req = rows[0];
      if (!req) return { status: "not_found", invoiceId: null };

      return {
        status: req.status,
        invoiceId: req.invoiceId,
        mfStatus: req.mfStatus,
      };
    }),
};
