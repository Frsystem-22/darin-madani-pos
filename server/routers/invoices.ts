import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  getInvoices, getInvoiceById, getInvoiceByToken, createInvoice,
  updateInvoice, generateInvoiceNumber, getReturns, getReturnById,
  createReturn, generateReturnNumber, getSettings, upsertProductStock,
  addStockMovement, updateCustomer, getCustomerById
} from "../db";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { nanoid } from "nanoid";
import axios from "axios";

// ─── WhatsApp via Evolution API ─────────────────────────────────────────────
async function sendWhatsApp(phone: string, message: string, settings: any): Promise<boolean> {
  if (!settings?.whatsappEnabled || !settings?.whatsappInstance) return false;
  try {
    let num = phone.replace(/[^0-9]/g, "");
    if (num.startsWith("0")) num = "966" + num.slice(1);
    if (num.length < 10) return false;
    const base = settings.whatsappApiBase || "https://elv.academy-smart.com";
    const res = await axios.post(
      `${base}/message/sendText/${settings.whatsappInstance}`,
      { number: num, text: message },
      { headers: { "Content-Type": "application/json", apikey: settings.whatsappApiKey }, timeout: 15000 }
    );
    return res.status >= 200 && res.status < 300;
  } catch { return false; }
}

// ─── MyFatoorah ─────────────────────────────────────────────────────────────
async function createMyfatoorahPayment(invoice: any, settings: any, origin: string) {
  if (!settings?.myfatoorahEnabled || !settings?.myfatoorahToken) return null;
  const base = settings.myfatoorahEnv === "live" ? "https://api.myfatoorah.com" : "https://apitest.myfatoorah.com";
  const callbackUrl = `${origin}/api/payment-callback?invoice_id=${invoice.id}`;
  const payload: any = {
    CustomerName: invoice.customerName || "عميل",
    NotificationOption: "LNK",
    InvoiceValue: parseFloat(invoice.total),
    DisplayCurrencyIso: "SAR",
    CallBackUrl: callbackUrl,
    ErrorUrl: callbackUrl + "&status=error",
    Language: "AR",
    CustomerReference: invoice.invoiceNumber,
  };
  if (invoice.customerPhone) {
    payload.MobileCountryCode = "966";
    payload.CustomerMobile = invoice.customerPhone.replace(/^0/, "");
    payload.NotificationOption = "SMS";
  }
  if (settings.myfatoorahSupplier) {
    payload.Suppliers = [{ SupplierCode: parseInt(settings.myfatoorahSupplier), InvoiceShare: parseFloat(invoice.total) }];
  }
  try {
    const res = await axios.post(`${base}/v2/SendPayment`, payload, {
      headers: { Authorization: `Bearer ${settings.myfatoorahToken}`, "Content-Type": "application/json" },
      timeout: 30000,
    });
    const data = res.data?.Data;
    return { invoiceId: data?.InvoiceId, paymentUrl: data?.InvoiceURL, qrCode: data?.QrCodeUrl };
  } catch (e: any) {
    console.error("MyFatoorah error:", e?.response?.data || e.message);
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
      paymentStatus: "paid" as const,
      status: "completed" as const,
      notes: input.notes,
      cashierId: ctx.user.id,
    };

    const id = await createInvoice(invoiceData as any, input.items as any);
    if (!id) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

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
  })).mutation(async ({ input }) => {
    const settings = await getSettings();
    const inv = await getInvoiceById(input.invoiceId);
    if (!inv) throw new TRPCError({ code: "NOT_FOUND" });

    const storeName = settings?.storeName || "Darin Madani Fashion House";
    const currency = settings?.currencySymbol || "ر.س";
    const invoiceUrl = `${process.env.SITE_URL || ""}/invoice/${inv.token}`;

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
    }
    return { success: sent };
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
});
