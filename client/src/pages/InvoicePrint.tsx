import { useEffect, useRef, useState } from "react";
import { useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { Loader2, Printer, Share2, ArrowRight, Thermometer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import JsBarcode from "jsbarcode";

const LOGO_LIGHT = "/logo-light.webp";
const LOGO_DARK = "/logo-dark.webp";

function buildZATCATLV(
  sellerName: string,
  taxNumber: string,
  timestamp: string,
  totalAmount: number,
  vatAmount: number
): string {
  function tlv(tag: number, value: string): Uint8Array {
    const enc = new TextEncoder();
    const valBytes = enc.encode(String(value));
    const buf = new Uint8Array(2 + valBytes.length);
    buf[0] = tag;
    buf[1] = valBytes.length;
    buf.set(valBytes, 2);
    return buf;
  }
  function concat(arrays: Uint8Array[]): Uint8Array {
    const total = arrays.reduce((s, a) => s + a.length, 0);
    const out = new Uint8Array(total);
    let offset = 0;
    arrays.forEach((a) => { out.set(a, offset); offset += a.length; });
    return out;
  }
  const ts = timestamp ? new Date(timestamp).toISOString() : new Date().toISOString();
  const bytes = concat([
    tlv(1, sellerName || ""),
    tlv(2, taxNumber || ""),
    tlv(3, ts),
    tlv(4, Number(totalAmount).toFixed(2)),
    tlv(5, Number(vatAmount).toFixed(2)),
  ]);
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary);
}

export default function InvoicePrint() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const barcodeRef = useRef<SVGSVGElement>(null);
  const qrRef = useRef<HTMLImageElement>(null);
  const [barcodeReady, setBarcodeReady] = useState(false);

  const isNumericId = /^\d+$/.test(id || "");

  const { data: invoiceById, isLoading: loadingById } = trpc.invoices.get.useQuery(
    { id: Number(id) },
    { enabled: !!id && isNumericId }
  );

  const { data: invoiceByToken, isLoading: loadingByToken } = trpc.invoices.getByToken.useQuery(
    { token: id || "" },
    { enabled: !!id && !isNumericId }
  );

  const invoice = invoiceById || invoiceByToken;
  const isLoading = loadingById || loadingByToken;

  const { data: settingsData } = trpc.settings.get.useQuery();

  useEffect(() => {
    if (!invoice) return;
    const timer = setTimeout(() => {
      if (barcodeRef.current) {
        try {
          JsBarcode(barcodeRef.current, invoice.invoiceNumber || `INV-${invoice.id}`, {
            format: "CODE128",
            width: 1.6,
            height: 44,
            displayValue: true,
            fontSize: 11,
            margin: 6,
            background: "#ffffff",
            lineColor: "#1a1a1a",
          });
          setBarcodeReady(true);
        } catch (e) {
          console.error("Barcode error:", e);
        }
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [invoice]);

  useEffect(() => {
    if (invoice && settingsData && qrRef.current) {
      const zatcaBase64 = buildZATCATLV(
        settingsData.storeName || "Darin Madani Fashion House",
        settingsData.taxNumber || "",
        invoice.createdAt ? new Date(invoice.createdAt).toISOString() : new Date().toISOString(),
        Number(invoice.total || 0),
        Number(invoice.taxAmount || 0)
      );
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(zatcaBase64)}`;
      qrRef.current.src = qrUrl;
    }
  }, [invoice, settingsData]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-[#C9A96E]" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4 bg-gray-50">
        <p className="text-gray-500">الفاتورة غير موجودة</p>
        <Button onClick={() => navigate("/invoices")}>
          <ArrowRight className="w-4 h-4 me-2" /> العودة للفواتير
        </Button>
      </div>
    );
  }

  const store = (invoice as any)?.settings || settingsData;
  const storeName = store?.storeName || "Darin Madani Fashion House";
  const storeNameEn = store?.storeNameEn || "FASHION HOUSE";
  const storePhone = store?.storePhone || "";
  const storeAddress = store?.storeAddress || "";
  const vatNumber = store?.taxNumber || "";
  const taxRate = Number(store?.taxRate || 15);
  const rawPIT = store?.priceIncludesTax;
  const priceIncludesTax = rawPIT === true || (rawPIT as any) === 1 || (rawPIT as any) === "1";

  const subtotal = Number(invoice.subtotal || 0);
  const discount = Number(invoice.discountAmount || 0);
  const taxAmount = Number(invoice.taxAmount || 0);
  const total = Number(invoice.total || 0);

  const invoiceDate = invoice.createdAt
    ? new Date(invoice.createdAt).toLocaleDateString("ar-SA", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "-";

  const handlePrint = () => window.print();

  const handleThermalPrint = () => {
    const invoiceNum = invoice.invoiceNumber || `INV-${invoice.id}`;
    const zatcaBase64 = buildZATCATLV(
      storeName,
      vatNumber,
      invoice.createdAt ? new Date(invoice.createdAt).toISOString() : new Date().toISOString(),
      total,
      taxAmount
    );
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(zatcaBase64)}`;
    const itemsHtml = (invoice.items || []).map((item: any) => {
      const qty = item.qty ?? item.quantity ?? 1;
      const price = Number(item.unitPrice || item.price || 0);
      const lineTotal = qty * price;
      const detail = [item.color, item.size].filter(Boolean).join(' · ');
      return `<tr>
        <td style="padding:2px 0;font-size:10px;">${item.productName || item.name || '—'}${detail ? `<br><span style="font-size:9px;color:#666">${detail}</span>` : ''}</td>
        <td style="padding:2px 0;font-size:10px;text-align:center;">${qty}</td>
        <td style="padding:2px 0;font-size:10px;text-align:left;">${price.toFixed(2)}</td>
        <td style="padding:2px 0;font-size:10px;text-align:left;">${lineTotal.toFixed(2)}</td>
      </tr>`;
    }).join('');
    const discountRow = discount > 0 ? `<tr><td colspan="2" style="font-size:10px;">الخصم</td><td colspan="2" style="font-size:10px;text-align:left;">- ${discount.toFixed(2)}</td></tr>` : '';
    const html = `<!DOCTYPE html>
<html dir="rtl">
<head>
<meta charset="UTF-8">
<title>فاتورة ${invoiceNum}</title>
<style>
  @page { size: 58mm auto; margin: 2mm; }
  * { box-sizing: border-box; }
  body { font-family: 'Arial', sans-serif; width: 54mm; margin: 0 auto; font-size: 10px; color: #000; direction: rtl; }
  .center { text-align: center; }
  .bold { font-weight: bold; }
  .divider { border-top: 1px dashed #000; margin: 3px 0; }
  .logo { max-width: 40mm; max-height: 15mm; object-fit: contain; display: block; margin: 0 auto 3px; }
  table { width: 100%; border-collapse: collapse; }
  th { font-size: 9px; border-bottom: 1px solid #000; padding: 2px 0; }
  .total-row { font-size: 12px; font-weight: bold; border-top: 1px solid #000; padding-top: 3px; }
  .qr { display: block; margin: 4px auto; width: 20mm; height: 20mm; }
  .footer { font-size: 9px; text-align: center; margin-top: 4px; }
</style>
</head>
<body>
<div class="center">
  <img class="logo" src="${store?.storeLogo || '/logo-light.webp'}" onerror="this.style.display='none'" />
  <div class="bold" style="font-size:12px;">${storeName}</div>
  ${storePhone ? `<div style="font-size:9px;">${storePhone}</div>` : ''}
  ${vatNumber ? `<div style="font-size:9px;">الرقم الضريبي: ${vatNumber}</div>` : ''}
</div>
<div class="divider"></div>
<div style="font-size:9px;">
  <div>فاتورة ضريبية: <span class="bold">${invoiceNum}</span></div>
  <div>التاريخ: ${invoiceDate}</div>
  <div>العميل: ${invoice.customerName || 'عميل نقدي'}</div>
  <div>الدفع: ${paymentLabel}</div>
</div>
<div class="divider"></div>
<table>
  <thead><tr>
    <th style="text-align:right;">المنتج</th>
    <th style="text-align:center;">كمية</th>
    <th style="text-align:left;">سعر</th>
    <th style="text-align:left;">إجمالي</th>
  </tr></thead>
  <tbody>${itemsHtml}</tbody>
</table>
<div class="divider"></div>
<table>
  <tr><td style="font-size:10px;">المجموع الفرعي</td><td colspan="3" style="font-size:10px;text-align:left;">${subtotal.toFixed(2)} ر.س</td></tr>
  ${discountRow}
  <tr><td style="font-size:10px;">ضريبة (${taxRate}%)</td><td colspan="3" style="font-size:10px;text-align:left;">${taxAmount.toFixed(2)} ر.س</td></tr>
  <tr class="total-row"><td>الإجمالي</td><td colspan="3" style="text-align:left;">${total.toFixed(2)} ر.س</td></tr>
</table>
<div class="divider"></div>
<div class="center">
  <img class="qr" src="${qrUrl}" />
  <div style="font-size:8px;">ZATCA QR</div>
</div>
<div class="footer">
  <div>شكراً لتسوقك من ${storeName}</div>
  <div>Thank you for shopping with us</div>
  ${store?.invoiceNote ? `<div style="margin-top:3px;">${store.invoiceNote}</div>` : ''}
</div>
</body>
</html>`;
    const win = window.open('', '_blank', 'width=300,height=600');
    if (win) {
      win.document.write(html);
      win.document.close();
      win.onload = () => { win.focus(); win.print(); };
    }
  };

  const handleWhatsApp = () => {
    const phone = (invoice.customerPhone || "").replace(/[^0-9]/g, "");
    if (!phone) { alert("لا يوجد رقم هاتف للعميل"); return; }
    const num = phone.length === 10 && phone.startsWith("0") ? "966" + phone.slice(1) : phone;
    const invoiceUrl = window.location.href;
    const msg = `🛍️ شكراً لتسوقك في *${storeName}*\n\nفاتورة رقم: *${invoice.invoiceNumber || `INV-${invoice.id}`}*\nالإجمالي: *${total.toFixed(2)} ر.س*\n\n📄 رابط الفاتورة:\n${invoiceUrl}\n\nنتطلع لخدمتك دائماً 💛`;
    window.open(`https://wa.me/${num}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const paymentLabel =
    invoice.paymentMethod === "cash" ? "نقداً" :
    invoice.paymentMethod === "card" ? "بطاقة" :
    invoice.paymentMethod === "transfer" ? "تحويل" :
    invoice.paymentMethod === "mixed" ? "متعدد" :
    invoice.paymentMethod || "نقداً";

  return (
    <div className="min-h-screen bg-gray-100 py-4 px-3" dir="rtl">
      {/* أزرار الإجراءات */}
      <div className="max-w-lg mx-auto mb-4 flex gap-2 print:hidden">
        <Button onClick={() => navigate("/invoices")} variant="outline" size="sm" className="flex-1">
          <ArrowRight className="w-4 h-4 me-1" /> العودة
        </Button>
        <Button onClick={handlePrint} size="sm" className="flex-1 bg-[#1a1a1a] hover:bg-[#333] text-white">
          <Printer className="w-4 h-4 me-1" /> طباعة
        </Button>
        <Button onClick={handleThermalPrint} size="sm" className="flex-1 bg-orange-500 hover:bg-orange-600 text-white">
          <Printer className="w-4 h-4 me-1" /> حرارية 58mm
        </Button>
        <Button onClick={handleWhatsApp} size="sm" className="flex-1 bg-[#25d366] hover:bg-[#1ebe5d] text-white">
          <Share2 className="w-4 h-4 me-1" /> واتساب
        </Button>
      </div>

      {/* بطاقة الفاتورة */}
      <div
        id="invoiceContainer"
        className="max-w-lg mx-auto bg-white rounded-2xl shadow-lg overflow-hidden print:shadow-none print:rounded-none print:max-w-full"
      >
        {/* ─── رأس الفاتورة ─── */}
        <div className="bg-[#1a1a1a] px-6 py-5">
          {/* الشعار + اسم المتجر */}
          <div className="flex flex-col items-center gap-3 mb-4">
            <img
              src={store?.storeLogo || LOGO_DARK}
              alt={storeName}
              className="h-20 w-auto object-contain"
              onError={(e) => {
                const img = e.target as HTMLImageElement;
                if (img.src !== LOGO_DARK) {
                  img.src = LOGO_DARK;
                } else {
                  img.style.display = "none";
                }
              }}
            />
            <div className="text-center">
              <h1 className="text-[#C9A96E] font-bold text-lg tracking-widest">{storeName}</h1>
              <p className="text-[#C9A96E]/60 text-xs tracking-widest uppercase">{storeNameEn}</p>
            </div>
          </div>

          {/* رقم الفاتورة + نوعها */}
          <div className="border-t border-[#C9A96E]/30 pt-3 flex items-center justify-between">
            <div>
              <p className="text-white/50 text-xs">Tax Invoice</p>
              <p className="text-white font-semibold text-sm">فاتورة ضريبية</p>
            </div>
            <div className="text-left">
              <p className="text-[#C9A96E] font-mono font-bold text-base">
                {invoice.invoiceNumber || `INV-${invoice.id}`}
              </p>
              <p className="text-white/50 text-xs text-left">{invoiceDate}</p>
            </div>
          </div>
        </div>

        {/* خط ذهبي */}
        <div className="h-0.5 bg-gradient-to-r from-[#C9A96E] via-[#e8c98a] to-[#C9A96E]" />

        <div className="px-5 py-5 space-y-5">
          {/* ─── بيانات البائع والعميل ─── */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-amber-50 rounded-xl p-3 border border-[#C9A96E]/30">
              <p className="text-[10px] text-[#C9A96E] font-bold uppercase tracking-wider mb-1.5">البائع</p>
              <p className="font-bold text-gray-800 text-sm leading-tight">{storeName}</p>
              {storePhone && <p className="text-gray-500 text-xs mt-1">📞 {storePhone}</p>}
              {storeAddress && <p className="text-gray-500 text-xs mt-0.5 leading-tight">📍 {storeAddress}</p>}
              {vatNumber && (
                <p className="text-gray-500 text-xs mt-1">
                  الرقم الضريبي:<br />
                  <span className="font-mono text-gray-700">{vatNumber}</span>
                </p>
              )}
            </div>

            <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1.5">العميل</p>
              <p className="font-bold text-gray-800 text-sm leading-tight">
                {invoice.customerName || "عميل نقدي"}
              </p>
              {invoice.customerPhone && (
                <p className="text-gray-500 text-xs mt-1">📞 {invoice.customerPhone}</p>
              )}
              <p className="text-gray-500 text-xs mt-1.5">
                💳 {paymentLabel}
              </p>
            </div>
          </div>

          {/* ─── جدول المنتجات ─── */}
          <div className="rounded-xl overflow-hidden border border-gray-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#1a1a1a] text-white text-xs">
                  <th className="px-3 py-2.5 text-right font-semibold">المنتج</th>
                  <th className="px-3 py-2.5 text-center font-semibold w-12">الكمية</th>
                  <th className="px-3 py-2.5 text-left font-semibold w-20">السعر</th>
                  <th className="px-3 py-2.5 text-left font-semibold w-20">الإجمالي</th>
                </tr>
              </thead>
              <tbody>
                {(invoice.items || []).map((item: any, idx: number) => (
                  <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50/70"}>
                    <td className="px-3 py-2.5">
                      <p className="font-medium text-gray-800 text-sm leading-tight">
                        {item.productName || item.name || "—"}
                      </p>
                      {(item.color || item.size) && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          {[item.color, item.size].filter(Boolean).join(" · ")}
                        </p>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-center text-gray-700 font-medium">
                      {item.qty ?? item.quantity ?? 1}
                    </td>
                    <td className="px-3 py-2.5 text-left text-gray-600 font-mono text-xs">
                      {Number(item.unitPrice || item.price || 0).toFixed(2)}
                    </td>
                    <td className="px-3 py-2.5 text-left font-semibold text-gray-800 font-mono text-xs">
                      {(Number(item.qty ?? item.quantity ?? 1) * Number(item.unitPrice || item.price || 0)).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ─── الإجماليات + QR ─── */}
          <div className="flex gap-4 items-start">
            {/* QR ZATCA */}
            <div className="flex flex-col items-center gap-1 shrink-0">
              <div className="w-24 h-24 border border-gray-200 rounded-xl overflow-hidden bg-white flex items-center justify-center">
                <img
                  ref={qrRef}
                  alt="QR ZATCA"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).parentElement!.innerHTML =
                      '<p class="text-[10px] text-gray-400 text-center p-1">QR</p>';
                  }}
                />
              </div>
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">ZATCA</p>
            </div>

            {/* الأرقام */}
            <div className="flex-1 space-y-1.5">
              <div className="flex justify-between text-xs text-gray-500 py-1 border-b border-gray-100">
                <span>المجموع الفرعي</span>
                <span className="font-mono font-medium text-gray-700">{subtotal.toFixed(2)} ر.س</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-xs text-green-600 py-1 border-b border-gray-100">
                  <span>الخصم</span>
                  <span className="font-mono font-medium">- {discount.toFixed(2)} ر.س</span>
                </div>
              )}
              <div className="flex justify-between text-xs text-gray-500 py-1 border-b border-gray-100">
                <span>ضريبة ({taxRate}%)</span>
                <span className="font-mono font-medium text-gray-700">{taxAmount.toFixed(2)} ر.س</span>
              </div>
              <div className="flex justify-between items-center py-2.5 bg-[#1a1a1a] rounded-xl px-3 mt-1">
                <span className="text-[#C9A96E] font-bold text-xs">الإجمالي شامل الضريبة</span>
                <span className="text-white font-bold text-base font-mono">{total.toFixed(2)} ر.س</span>
              </div>
            </div>
          </div>

          {/* ─── باركود الفاتورة ─── */}
          <div className="flex flex-col items-center pt-4 border-t border-gray-100">
            <div className="bg-white rounded-xl px-4 py-2 flex flex-col items-center">
              <svg
                ref={barcodeRef}
                style={{ minHeight: barcodeReady ? "auto" : "56px", minWidth: "180px", maxWidth: "100%" }}
              />
              {!barcodeReady && (
                <div className="flex items-center gap-2 text-gray-400 text-xs py-2">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>جاري توليد الباركود...</span>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-400 font-mono mt-1">
              {invoice.invoiceNumber || `INV-${invoice.id}`}
            </p>
          </div>

          {/* ─── التذييل ─── */}
          <div className="text-center pt-3 border-t border-gray-100 pb-1">
            <p className="text-[#C9A96E] font-semibold text-sm">
              شكراً لتسوقك من {storeName}
            </p>
            <p className="text-gray-400 text-xs mt-0.5">Thank you for shopping with us</p>
            {store?.invoiceNote && (
              <p className="text-gray-500 text-xs mt-2 italic">{store.invoiceNote}</p>
            )}
          </div>
        </div>
      </div>

      {/* CSS الطباعة */}
      <style>{`
        @media print {
          body { background: white !important; margin: 0; }
          .print\\:hidden { display: none !important; }
          #invoiceContainer {
            box-shadow: none !important;
            border-radius: 0 !important;
            max-width: 100% !important;
            margin: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
