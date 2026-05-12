import { useEffect, useRef, useState } from "react";
import { useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { Loader2, Printer, Share2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import JsBarcode from "jsbarcode";

const LOGO_LIGHT = "/manus-storage/darin-logo-light_cdfb497b.webp";
const LOGO_DARK = "/manus-storage/darin-logo-dark_7e882b9c.webp";

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

  // Support both numeric id and token (for public sharing links)
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
    // Small delay to ensure SVG is mounted in DOM
    const timer = setTimeout(() => {
      if (barcodeRef.current) {
        try {
          JsBarcode(barcodeRef.current, invoice.invoiceNumber || `INV-${invoice.id}`, {
            format: "CODE128",
            width: 1.8,
            height: 50,
            displayValue: true,
            fontSize: 12,
            margin: 6,
            background: "#ffffff",
            lineColor: "#1a1a1a",
          });
          setBarcodeReady(true);
        } catch (e) {
          console.error("Barcode generation error:", e);
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
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=130x130&data=${encodeURIComponent(zatcaBase64)}`;
      qrRef.current.src = qrUrl;
    }
  }, [invoice, settingsData]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#C9A96E]" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <p className="text-gray-500">الفاتورة غير موجودة</p>
        <Button onClick={() => navigate("/invoices")}>
          <ArrowRight className="w-4 h-4 me-2" /> العودة للفواتير
        </Button>
      </div>
    );
  }

  const store = settingsData;
  const storeName = store?.storeName || "Darin Madani Fashion House";
  const storePhone = store?.storePhone || "";
  const storeAddress = store?.storeAddress || "";
    const vatNumber = store?.taxNumber || "";
  const taxRate = Number(store?.taxRate || 15);
  const priceIncludesTax = store?.priceIncludesTax ?? true;

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

  const handleWhatsApp = () => {
    const phone = (invoice.customerPhone || "").replace(/[^0-9]/g, "");
    if (!phone) { alert("لا يوجد رقم هاتف للعميل"); return; }
    const num = phone.length === 10 && phone.startsWith("0") ? "966" + phone.slice(1) : phone;
    const invoiceUrl = window.location.href;
    const msg = `مرحباً ${invoice.customerName || ""}،\n\nشكراً لتسوقك من ${storeName} 🛍️\n\nفاتورتك رقم: *${invoice.invoiceNumber || `INV-${invoice.id}`}*\nالمبلغ الإجمالي: *${total.toFixed(2)} ريال*\n\nرابط الفاتورة:\n${invoiceUrl}`;
    window.open(`https://wa.me/${num}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 px-4" dir="rtl">
      {/* أزرار الإجراءات - تُخفى عند الطباعة */}
      <div className="max-w-3xl mx-auto mb-4 flex gap-3 print:hidden">
        <Button onClick={() => navigate("/invoices")} variant="outline" size="sm">
          <ArrowRight className="w-4 h-4 me-2" /> العودة
        </Button>
        <Button onClick={handlePrint} className="bg-[#1a1a1a] hover:bg-[#333] text-white" size="sm">
          <Printer className="w-4 h-4 me-2" /> طباعة
        </Button>
        <Button onClick={handleWhatsApp} className="bg-[#25d366] hover:bg-[#1ebe5d] text-white" size="sm">
          <Share2 className="w-4 h-4 me-2" /> إرسال واتساب
        </Button>
      </div>

      {/* الفاتورة */}
      <div
        id="invoiceContainer"
        className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden print:shadow-none print:rounded-none"
      >
        {/* الرأس الذهبي */}
        <div className="bg-[#1a1a1a] px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* شعار المتجر: من الإعدادات أو الشعار الافتراضي */}
            {(store?.storeLogo || LOGO_DARK) && (
              <img
                src={store?.storeLogo || LOGO_DARK}
                alt={storeName}
                className="h-16 w-auto object-contain"
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  // Try fallback logo
                  if (img.src !== LOGO_DARK) {
                    img.src = LOGO_DARK;
                  } else {
                    img.style.display = "none";
                  }
                }}
              />
            )}
            <div>
              <h1 className="text-[#C9A96E] font-bold text-xl tracking-widest uppercase">
                {storeName}
              </h1>
              <p className="text-[#C9A96E]/70 text-xs tracking-widest uppercase">Fashion House</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[#C9A96E] font-bold text-lg">فاتورة ضريبية</p>
            <p className="text-white/70 text-sm">Tax Invoice</p>
            <p className="text-[#C9A96E] font-mono text-base mt-1">
              #{invoice.invoiceNumber || `INV-${invoice.id}`}
            </p>
          </div>
        </div>

        {/* خط ذهبي */}
        <div className="h-1 bg-gradient-to-r from-[#C9A96E] via-[#e8c98a] to-[#C9A96E]" />

        <div className="px-8 py-6 space-y-6">
          {/* معلومات الفاتورة والعميل */}
          <div className="grid grid-cols-2 gap-6">
            {/* بيانات المتجر */}
            <div className="bg-gray-50 rounded-xl p-4 border-r-4 border-[#C9A96E]">
              <p className="text-xs text-[#C9A96E] font-bold uppercase tracking-wider mb-2">بيانات البائع</p>
              <p className="font-bold text-gray-800">{storeName}</p>
              {storePhone && <p className="text-gray-600 text-sm mt-1">📞 {storePhone}</p>}
              {storeAddress && <p className="text-gray-600 text-sm mt-0.5">📍 {storeAddress}</p>}
              {vatNumber && (
                <p className="text-gray-600 text-sm mt-0.5">
                  الرقم الضريبي: <span className="font-mono">{vatNumber}</span>
                </p>
              )}
            </div>

            {/* بيانات العميل */}
            <div className="bg-gray-50 rounded-xl p-4 border-r-4 border-gray-300">
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2">بيانات العميل</p>
              <p className="font-bold text-gray-800">{invoice.customerName || "عميل نقدي"}</p>
              {invoice.customerPhone && (
                <p className="text-gray-600 text-sm mt-1">📞 {invoice.customerPhone}</p>
              )}
              <p className="text-gray-500 text-sm mt-2">
                📅 تاريخ الفاتورة: <span className="font-medium">{invoiceDate}</span>
              </p>
              <p className="text-gray-500 text-sm mt-0.5">
                💳 طريقة الدفع:{" "}
                <span className="font-medium">
                  {invoice.paymentMethod === "cash" ? "نقداً" :
                   invoice.paymentMethod === "card" ? "بطاقة" :
                   invoice.paymentMethod === "transfer" ? "تحويل" :
                   invoice.paymentMethod === "mixed" ? "متعدد" : invoice.paymentMethod}
                </span>
              </p>
            </div>
          </div>

          {/* جدول المنتجات */}
          <div className="overflow-hidden rounded-xl border border-gray-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#1a1a1a] text-white">
                  <th className="px-4 py-3 text-right font-semibold">المنتج</th>
                  <th className="px-4 py-3 text-center font-semibold w-20">الكمية</th>
                  <th className="px-4 py-3 text-left font-semibold w-28">سعر الوحدة</th>
                  <th className="px-4 py-3 text-left font-semibold w-28">الإجمالي</th>
                </tr>
              </thead>
              <tbody>
                {(invoice.items || []).map((item: any, idx: number) => (
                  <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{item.productName || item.name}</p>
                      {(item.color || item.size) && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          {item.color && `اللون: ${item.color}`}
                          {item.color && item.size && " | "}
                          {item.size && `المقاس: ${item.size}`}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-700">{item.quantity}</td>
                    <td className="px-4 py-3 text-left text-gray-700 font-mono">
                      {Number(item.unitPrice || item.price || 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-left font-semibold text-gray-800 font-mono">
                      {(Number(item.quantity) * Number(item.unitPrice || item.price || 0)).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* الإجماليات والـ QR */}
          <div className="flex items-start justify-between gap-6">
            {/* QR Code ZATCA */}
            <div className="flex flex-col items-center gap-2">
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">رمز QR (ZATCA)</p>
              <div className="w-32 h-32 border-2 border-gray-200 rounded-xl overflow-hidden flex items-center justify-center bg-white">
                <img
                  ref={qrRef}
                  alt="QR ZATCA"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).parentElement!.innerHTML =
                      '<p class="text-xs text-gray-400 text-center p-2">QR غير متاح</p>';
                  }}
                />
              </div>
            </div>

            {/* الأرقام */}
            <div className="flex-1 space-y-2">
              <div className="flex justify-between text-sm text-gray-600 py-1 border-b border-gray-100">
                <span>المجموع الفرعي</span>
                <span className="font-mono font-medium">{subtotal.toFixed(2)} ر.س</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm text-green-600 py-1 border-b border-gray-100">
                  <span>الخصم</span>
                  <span className="font-mono font-medium">- {discount.toFixed(2)} ر.س</span>
                </div>
              )}
              <div className="flex justify-between text-sm text-gray-600 py-1 border-b border-gray-100">
                <span>ضريبة القيمة المضافة ({taxRate}%)</span>
                <span className="font-mono font-medium">{taxAmount.toFixed(2)} ر.س</span>
              </div>
              <div className="flex justify-between items-center py-2 bg-[#1a1a1a] rounded-xl px-4 mt-2">
                <span className="text-[#C9A96E] font-bold text-base">الإجمالي شامل الضريبة</span>
                <span className="text-white font-bold text-xl font-mono">{total.toFixed(2)} ر.س</span>
              </div>
            </div>
          </div>

          {/* باركود الفاتورة */}
          <div className="flex flex-col items-center gap-2 pt-4 border-t border-gray-100">
            <p className="text-xs text-[#C9A96E] font-bold uppercase tracking-wider mb-1">باركود الفاتورة</p>
            <div className="bg-white border border-gray-200 rounded-xl p-3 flex flex-col items-center">
              <svg ref={barcodeRef} className="max-w-xs" style={{ minHeight: barcodeReady ? 'auto' : '60px', minWidth: '200px' }} />
              {!barcodeReady && (
                <div className="flex items-center gap-2 text-gray-400 text-xs py-2">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>جاري توليد الباركود...</span>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 font-mono">
              {invoice.invoiceNumber || `INV-${invoice.id}`}
            </p>
          </div>

          {/* التذييل */}
          <div className="text-center pt-4 border-t border-gray-100">
            <p className="text-[#C9A96E] font-semibold text-sm">
              شكراً لتسوقك من Darin Madani Fashion House
            </p>
            <p className="text-gray-400 text-xs mt-1">
              Thank you for shopping with us
            </p>
            {store?.invoiceNote && (
              <p className="text-gray-500 text-xs mt-2 italic">{store.invoiceNote}</p>
            )}
          </div>
        </div>
      </div>

      {/* CSS للطباعة */}
      <style>{`
        @media print {
          body { background: white !important; }
          .print\\:hidden { display: none !important; }
          #invoiceContainer {
            box-shadow: none !important;
            border-radius: 0 !important;
            max-width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
}
