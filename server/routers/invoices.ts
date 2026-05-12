import { z } from "zod";
import { sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import {
  getInvoices, getInvoiceById, getInvoiceByToken, createInvoice,
  updateInvoice, generateInvoiceNumber, getReturns, getReturnById,
  createReturn, generateReturnNumber, getSettings, upsertProductStock,
  addStockMovement, updateCustomer, getCustomerById, getDb
} from "../db";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { nanoid } from "nanoid";
import axios from "axios";

// ─── WhatsApp via Evolution API ─────────────────────────────────────────────
async function sendWhatsApp(phone: string, message: string, settings: any): Promise<boolean> {
  // Get instance from settings (saved by whatsapp router) or from whatsappInstance field
  const instanceName = settings?.whatsappInstance;
  if (!instanceName) {
    console.log("[WhatsApp] No instance configured");
    return false;
  }
  // Use env vars (same as whatsapp router) as primary, settings fields as fallback
  const base = process.env.WHATSAPP_API_BASE || settings?.whatsappApiBase || "https://elv.academy-smart.com";
  const apiKey = process.env.WHATSAPP_API_KEY || settings?.whatsappApiKey || "BQYHJGJHJ";
  try {
    let num = phone.replace(/[^0-9]/g, "");
    if (num.startsWith("0") && num.length === 10) num = "966" + num.slice(1);
    else if (num.length === 9) num = "966" + num;
    if (num.length < 10) {
      console.log("[WhatsApp] Invalid phone number:", phone);
      return false;
    }
    console.log(`[WhatsApp] Sending to ${num} via instance ${instanceName}`);
    const res = await axios.post(
      `${base}/message/sendText/${instanceName}`,
      { number: num, text: message },
      { headers: { "Content-Type": "application/json", apikey: apiKey }, timeout: 15000 }
    );
    console.log(`[WhatsApp] Response: ${res.status}`, JSON.stringify(res.data).slice(0, 200));
    return res.status >= 200 && res.status < 300;
  } catch (e: any) {
    console.error("[WhatsApp] Send error:", e?.response?.data || e?.message);
    return false;
  }
}

// ─── MyFatoorah ─────────────────────────────────────────────────────────────
/// Supplier Code read from settings (myfatoorahSupplier)
async function createMyfatoorahPayment(invoice: any, settings: any, origin: string) {
  if (!settings?.myfatoorahToken) return null;
  const supplierCode = settings.myfatoorahSupplier ? Number(settings.myfatoorahSupplier) : 24;
  const isLive = settings.myfatoorahEnv === "live";
  const base = isLive ? "https://api.myfatoorah.com" : "https://apitest.myfatoorah.com";
  const callbackUrl = `${origin}/api/payment-callback?invoice_id=${invoice.id}`;
  const amount = parseFloat(invoice.total);

  // تنظيف رقم الجوال بنفس آلية PHP
  let mobile = (invoice.customerPhone || "").replace(/[^0-9]/g, "");
  if (mobile.startsWith("0") && mobile.length === 10) mobile = "966" + mobile.slice(1);
  else if (mobile.length === 9) mobile = "966" + mobile;

  const payload: any = {
    CustomerName: invoice.customerName || "عميل",
    NotificationOption: mobile ? "SMS" : "LNK",
    InvoiceValue: amount,
    DisplayCurrencyIso: "SAR",
    MobileCountryCode: "+966",
    CustomerMobile: mobile || "0500000000",
    CustomerEmail: invoice.customerEmail || "noreply@darinmadani.com",
    CallBackUrl: callbackUrl,
    ErrorUrl: callbackUrl + "&status=error",
    Language: "AR",
    CustomerReference: invoice.invoiceNumber,
    InvoiceItems: [{ ItemName: `فاتورة رقم ${invoice.invoiceNumber}`, Quantity: 1, UnitPrice: amount }],
    // Supplier Code ثابت = 24
    Suppliers: [{ SupplierCode: supplierCode, InvoiceShare: amount, ProposedShare: null }],
  };

  try {
    const res = await axios.post(`${base}/v2/SendPayment`, payload, {
      headers: { Authorization: `Bearer ${settings.myfatoorahToken}`, "Content-Type": "application/json" },
      timeout: 30000,
    });
    const data = res.data?.Data;
    return { invoiceId: data?.InvoiceId, paymentUrl: data?.InvoiceURL, qrCode: data?.QrCodeUrl };
  } catch (e: any) {
    const errMsg = e?.response?.data?.Message || e?.response?.data?.ValidationErrors?.[0]?.Error || e.message;
    console.error("MyFatoorah error:", errMsg);
    return null;
  }
}

export const invoicesRouter = router({
  list: protectedProcedure.input(z.object({
    search: z.string().optional(),
    status: z.string().optional(),
    from: z.date().optional(),
    to: z.date().optional(),
    customerId: z.number().optional(),
  }).optional()).query(async ({ input }) => {
    return await getInvoices(input);
  }),

  get: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
    const inv = await getInvoiceById(input.id);
    if (!inv) throw new TRPCError({ code: "NOT_FOUND" });
    return inv;
  }),

  getByToken: publicProcedure.input(z.object({ token: z.string() })).query(async ({ input }) => {
    const inv = await getInvoiceByToken(input.token);
    if (!inv) throw new TRPCError({ code: "NOT_FOUND" });
    return inv;
  }),

  create: protectedProcedure.input(z.object({
    customerId: z.number().optional(),
    customerName: z.string().optional(),
    customerPhone: z.string().optional(),
    warehouseId: z.number().optional(),
    items: z.array(z.object({
      productId: z.number().optional(),
      productName: z.string(),
      productNameEn: z.string().optional(),
      barcode: z.string().optional(),
      color: z.string().optional(),
      size: z.string().optional(),
      qty: z.number().min(1),
      unitPrice: z.string(),
      discountPct: z.string().optional(),
      lineTotal: z.string(),
    })),
    subtotal: z.string(),
    discountType: z.enum(["percentage", "fixed", "none"]).optional(),
    discountValue: z.string().optional(),
    discountAmount: z.string().optional(),
    discountId: z.number().optional(),
    taxRate: z.string().optional(),
    taxAmount: z.string().optional(),
    total: z.string(),
    paymentMethod: z.enum(["cash", "card", "transfer", "electronic", "mixed"]).optional(),
    paymentSplits: z.array(z.object({
      method: z.enum(["cash", "card", "transfer", "electronic"]),
      amount: z.string(),
    })).optional(),
    notes: z.string().optional(),
    origin: z.string().optional(),
  })).mutation(async ({ input, ctx }) => {
    const invoiceNumber = await generateInvoiceNumber();
    const token = nanoid(32);
    const settings = await getSettings();

    const invoiceData = {
      invoiceNumber,
      token,
      customerId: input.customerId,
      customerName: input.customerName,
      customerPhone: input.customerPhone,
      warehouseId: input.warehouseId || 1,
      subtotal: input.subtotal,
      discountType: input.discountType || "none",
      discountValue: input.discountValue || "0",
      discountAmount: input.discountAmount || "0",
      discountId: input.discountId,
      taxRate: input.taxRate || "0",
      taxAmount: input.taxAmount || "0",
      total: input.total,
      paymentMethod: input.paymentMethod || "cash",
      // Electronic payments start as pending until confirmed by MyFatoorah callback
      paymentStatus: (input.paymentMethod === "electronic" ? "pending" : "paid") as any,
      status: "completed" as const,
      notes: input.notes,
      cashierId: ctx.user.id,
    };

    const id = await createInvoice(invoiceData as any, input.items as any);
    if (!id) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    // Save payment splits for mixed payments
    if (input.paymentMethod === "mixed" && input.paymentSplits && input.paymentSplits.length > 0) {
      const db = await getDb();
      if (db) {
        for (const split of input.paymentSplits) {
          if (parseFloat(split.amount) > 0) {
            const invoiceId = id;
            const method = split.method;
            const amount = split.amount;
            await db.execute(sql`INSERT INTO invoice_payments (invoiceId, method, amount, createdAt) VALUES (${invoiceId}, ${method}, ${amount}, NOW())`);
          }
        }
      }
    }

    // Deduct stock
    const warehouseId = input.warehouseId || 1;
    for (const item of input.items) {
      if (item.productId) {
        await upsertProductStock(item.productId, warehouseId, -item.qty);
        await addStockMovement({
          productId: item.productId,
          warehouseId,
          type: "sale",
          qty: -item.qty,
          reference: invoiceNumber,
          userId: ctx.user.id,
        });
      }
    }

    // Update customer total spent
    if (input.customerId) {
      const customer = await getCustomerById(input.customerId);
      if (customer) {
        const newTotal = (parseFloat(String(customer.totalSpent || "0")) + parseFloat(input.total)).toFixed(2);
        await updateCustomer(input.customerId, { totalSpent: newTotal, points: (customer.points || 0) + Math.floor(parseFloat(input.total)) });
      }
    }

    // MyFatoorah payment if electronic
    let mfData = null;
    if (input.paymentMethod === "electronic" && input.origin) {
      const inv = await getInvoiceById(id);
      mfData = await createMyfatoorahPayment({ ...inv, invoiceNumber, total: input.total, customerName: input.customerName, customerPhone: input.customerPhone }, settings, input.origin);
      if (mfData) {
        await updateInvoice(id, { mfInvoiceId: String(mfData.invoiceId), mfPaymentUrl: mfData.paymentUrl, mfQrCode: mfData.qrCode });
      }
    }

    return { success: true, id, invoiceNumber, token, mfData };
  }),

  sendWhatsApp: protectedProcedure.input(z.object({
    invoiceId: z.number(),
    phone: z.string(),
    message: z.string().optional(),
    origin: z.string().optional(),
  })).mutation(async ({ input }) => {
    const settings = await getSettings();
    const inv = await getInvoiceById(input.invoiceId);
    if (!inv) throw new TRPCError({ code: "NOT_FOUND" });

    const storeName = settings?.storeName || "Darin Madani Fashion House";
    const currency = settings?.currencySymbol || "ر.س";
    // Use origin from request, or env, or production URL as fallback
    const siteBase = input.origin || process.env.SITE_URL || "https://darinpos-guiq96ki.manus.space";
    const invoiceUrl = `${siteBase}/invoice/${inv.token}`;

    const template = settings?.whatsappTemplate ||
      `🛍️ شكراً لتسوقك في *{storeName}*\n\nفاتورة رقم: *{invoiceNumber}*\nالإجمالي: *{total} {currency}*\n\n📄 رابط الفاتورة:\n{invoiceUrl}\n\nنتطلع لخدمتك دائماً 💛`;

    const message = input.message || template
      .replace("{storeName}", storeName)
      .replace("{invoiceNumber}", inv.invoiceNumber)
      .replace("{total}", inv.total)
      .replace("{currency}", currency)
      .replace("{invoiceUrl}", invoiceUrl);

    const sent = await sendWhatsApp(input.phone, message, settings);
    if (sent) {
      await updateInvoice(input.invoiceId, { whatsappSent: true, whatsappSentAt: new Date() });
      return { success: true };
    } else {
      // Check why it failed
      if (!settings?.whatsappInstance) {
        throw new TRPCError({ code: "PRECONDITION_FAILED", message: "واتساب غير مربوط. يرجى ربط الواتساب من صفحة الإعدادات" });
      }
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "فشل إرسال الرسالة عبر واتساب. تحقق من اتصال الواتساب ورقم الهاتف" });
    }
  }),

  createPaymentLink: protectedProcedure.input(z.object({
    invoiceId: z.number(),
    origin: z.string(),
  })).mutation(async ({ input }) => {
    const settings = await getSettings();
    const inv = await getInvoiceById(input.invoiceId);
    if (!inv) throw new TRPCError({ code: "NOT_FOUND" });
    const mfData = await createMyfatoorahPayment(inv, settings, input.origin);
    if (!mfData) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Payment gateway error" });
    await updateInvoice(input.invoiceId, { mfInvoiceId: String(mfData.invoiceId), mfPaymentUrl: mfData.paymentUrl, mfQrCode: mfData.qrCode });
    return { success: true, ...mfData };
  }),

  cancel: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    await updateInvoice(input.id, { status: "cancelled" });
    return { success: true };
  }),

  // Returns
  listReturns: protectedProcedure.input(z.object({ search: z.string().optional() }).optional()).query(async ({ input }) => {
    return await getReturns(input?.search);
  }),

  getReturn: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
    const r = await getReturnById(input.id);
    if (!r) throw new TRPCError({ code: "NOT_FOUND" });
    return r;
  }),

  createReturn: protectedProcedure.input(z.object({
    invoiceId: z.number(),
    invoiceNumber: z.string().optional(),
    customerId: z.number().optional(),
    customerName: z.string().optional(),
    warehouseId: z.number().optional(),
    items: z.array(z.object({
      productId: z.number().optional(),
      productName: z.string(),
      barcode: z.string().optional(),
      color: z.string().optional(),
      size: z.string().optional(),
      qty: z.number().min(1),
      unitPrice: z.string(),
      lineTotal: z.string(),
    })),
    refundAmount: z.string(),
    refundMethod: z.enum(["cash", "card", "transfer", "credit"]).optional(),
    reason: z.string().optional(),
  })).mutation(async ({ input, ctx }) => {
    const returnNumber = await generateReturnNumber();
    const id = await createReturn({
      returnNumber,
      invoiceId: input.invoiceId,
      invoiceNumber: input.invoiceNumber,
      customerId: input.customerId,
      customerName: input.customerName,
      warehouseId: input.warehouseId || 1,
      refundAmount: input.refundAmount,
      refundMethod: input.refundMethod || "cash",
      reason: input.reason,
      status: "completed",
      processedBy: ctx.user.id,
    } as any, input.items as any);

    if (!id) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    // Restore stock
    const warehouseId = input.warehouseId || 1;
    for (const item of input.items) {
      if (item.productId) {
        await upsertProductStock(item.productId, warehouseId, item.qty);
        await addStockMovement({
          productId: item.productId,
          warehouseId,
          type: "return",
          qty: item.qty,
          reference: returnNumber,
          userId: ctx.user.id,
        });
      }
    }

    // Mark invoice as returned
    await updateInvoice(input.invoiceId, { status: "returned", paymentStatus: "refunded" });

    return { success: true, id, returnNumber };
  }),

  // ─── Check MyFatoorah payment status (for polling from frontend) ──────────
  checkPaymentStatus: protectedProcedure.input(z.object({
    invoiceId: z.number(),
  })).query(async ({ input }) => {
    const inv = await getInvoiceById(input.invoiceId);
    if (!inv) throw new TRPCError({ code: "NOT_FOUND" });
    // If already marked paid, return immediately
    if (inv.paymentStatus === "paid" && inv.mfStatus === "CAPTURED") {
      return { paid: true, paymentStatus: "paid", mfStatus: "CAPTURED", mfPaymentUrl: inv.mfPaymentUrl, mfQrCode: inv.mfQrCode };
    }
    // If no MF invoice ID yet, just return current status
    if (!inv.mfInvoiceId) {
      return { paid: inv.paymentStatus === "paid", paymentStatus: inv.paymentStatus, mfStatus: inv.mfStatus, mfPaymentUrl: inv.mfPaymentUrl, mfQrCode: inv.mfQrCode };
    }
    // Query MyFatoorah for latest status
    const settings = await getSettings();
    if (!settings?.myfatoorahToken) {
      return { paid: inv.paymentStatus === "paid", paymentStatus: inv.paymentStatus, mfStatus: inv.mfStatus, mfPaymentUrl: inv.mfPaymentUrl, mfQrCode: inv.mfQrCode };
    }
    try {
      const isLive = settings.myfatoorahEnv === "live";
      const base = isLive ? "https://api.myfatoorah.com" : "https://apitest.myfatoorah.com";
      const res = await axios.post(`${base}/v2/GetPaymentStatus`,
        { Key: inv.mfInvoiceId, KeyType: "InvoiceId" },
        { headers: { Authorization: `Bearer ${settings.myfatoorahToken}`, "Content-Type": "application/json" }, timeout: 10000 }
      );
      const data = res.data?.Data;
      const mfStatus = data?.InvoiceStatus || "";
      const transStatus = data?.InvoiceTransactions?.[0]?.TransactionStatus || "";
      const isPaid = mfStatus === "Paid" || transStatus === "Succss" || transStatus === "Success";
      if (isPaid && inv.paymentStatus !== "paid") {
        await updateInvoice(input.invoiceId, { paymentStatus: "paid", mfStatus: "CAPTURED" });
      }
      return {
        paid: isPaid,
        paymentStatus: isPaid ? "paid" : (inv.paymentStatus || "pending"),
        mfStatus: isPaid ? "CAPTURED" : mfStatus,
        mfPaymentUrl: inv.mfPaymentUrl,
        mfQrCode: inv.mfQrCode,
      };
    } catch (e: any) {
      console.error("[MF] checkPaymentStatus error:", e?.message);
      return { paid: inv.paymentStatus === "paid", paymentStatus: inv.paymentStatus, mfStatus: inv.mfStatus, mfPaymentUrl: inv.mfPaymentUrl, mfQrCode: inv.mfQrCode };
    }
  }),
});
