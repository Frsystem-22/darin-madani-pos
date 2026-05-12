import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Search, ShoppingCart, Trash2, Plus, Minus, User, UserPlus,
  CreditCard, Banknote, Smartphone, Zap, CheckCircle,
  MessageCircle, Printer, X, Barcode, ChevronDown, Package, SplitSquareHorizontal
} from "lucide-react";
import { cn } from "@/lib/utils";
import BarcodeLabel from "@/components/BarcodeLabel";
import OnlinePaymentDialog from "@/components/OnlinePaymentDialog";

interface CartItem {
  productId: number;
  productName: string;
  productNameEn?: string;
  barcode?: string;
  color?: string;
  size?: string;
  qty: number;
  unitPrice: string;
  discountPct: string;
  lineTotal: string;
  availableQty: number;
}

interface PaymentSplit {
  method: "cash" | "card" | "transfer" | "electronic";
  amount: string;
}

export default function POS() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const currency = isAr ? "ر.س" : "SAR";

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [customerSearch, setCustomerSearch] = useState("");
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [warehouseId, setWarehouseId] = useState<number>(1);

  // Payment state
  const [paymentMode, setPaymentMode] = useState<"single" | "split">("single");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "transfer" | "electronic">("cash");
  const [paymentSplits, setPaymentSplits] = useState<PaymentSplit[]>([
    { method: "cash", amount: "" },
    { method: "card", amount: "" },
  ]);

  const [discountType, setDiscountType] = useState<"none" | "percentage" | "fixed">("none");
  const [discountValue, setDiscountValue] = useState("");
  const [receivedAmount, setReceivedAmount] = useState("");
  const [showPayDialog, setShowPayDialog] = useState(false);
  const [completedInvoice, setCompletedInvoice] = useState<any>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showPrintLabel, setShowPrintLabel] = useState<any>(null);

  // Online payment state
  const [showOnlinePayDialog, setShowOnlinePayDialog] = useState(false);
  const [onlinePayInvoiceId, setOnlinePayInvoiceId] = useState<number | null>(null);
  const [onlinePayQrUrl, setOnlinePayQrUrl] = useState<string | null>(null);
  const [onlinePayUrl, setOnlinePayUrl] = useState<string | null>(null);
  const [onlinePayStatus, setOnlinePayStatus] = useState<"waiting" | "paid" | "failed">("waiting");

  // Quick add customer dialog
  const [showQuickCustomer, setShowQuickCustomer] = useState(false);
  const [quickCustomerForm, setQuickCustomerForm] = useState({ name: "", phone: "", email: "" });

  const searchRef = useRef<HTMLInputElement>(null);
  const [scannerActive, setScannerActive] = useState(false);
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const utils = trpc.useUtils();

  // Auto-focus search input on mount
  useEffect(() => {
    const timer = setTimeout(() => searchRef.current?.focus(), 300);
    return () => clearTimeout(timer);
  }, []);

  const { data: products } = trpc.products.list.useQuery({ search: search || undefined, categoryId: categoryFilter !== "all" ? parseInt(categoryFilter) : undefined });
  const { data: categories } = trpc.settings.getCategories.useQuery();
  const { data: warehouses } = trpc.settings.getWarehouses.useQuery();
  const { data: customers } = trpc.customers.list.useQuery({ search: customerSearch || undefined }, { enabled: customerSearch.length > 0 || showCustomerDropdown });
  const { data: settings } = trpc.settings.get.useQuery();

  const createInvoice = trpc.invoices.create.useMutation();
  const sendWhatsApp = trpc.invoices.sendWhatsApp.useMutation();
  const createPaymentLink = trpc.invoices.createPaymentLink.useMutation();
  const createCustomer = trpc.customers.create.useMutation({
    onSuccess: (newCustomer: any) => {
      utils.customers.list.invalidate();
      setSelectedCustomer(newCustomer);
      setShowQuickCustomer(false);
      setQuickCustomerForm({ name: "", phone: "", email: "" });
      toast.success(isAr ? "تم إضافة العميل" : "Customer added");
    },
    onError: (e: any) => toast.error(e.message),
  });

  // Barcode scan handler - works globally (even when search input is focused)
  useEffect(() => {
    let buffer = "";
    let lastKey = 0;
    let scanTimer: ReturnType<typeof setTimeout> | null = null;
    const handler = (e: KeyboardEvent) => {
      const now = Date.now();
      // If typing too slow (>100ms between keys), it's manual typing - reset buffer
      if (now - lastKey > 100 && buffer.length > 0) {
        // Only reset if it's clearly manual (gap > 100ms)
        // But don't reset if it's the first key
      }
      if (now - lastKey > 300) buffer = "";
      lastKey = now;

      // Show scanner active indicator
      if (scanTimer) clearTimeout(scanTimer);
      setScannerActive(true);
      scanTimer = setTimeout(() => setScannerActive(false), 1000);

      if (e.key === "Enter" && buffer.length > 2) {
        e.preventDefault();
        const scanned = buffer.trim();
        buffer = "";
        // Only trigger if it looks like a barcode (fast scan)
        if (now - lastKey < 200) {
          handleBarcodeSearch(scanned);
        }
      } else if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
        buffer += e.key;
      }
    };
    window.addEventListener("keydown", handler);
    return () => {
      window.removeEventListener("keydown", handler);
      if (scanTimer) clearTimeout(scanTimer);
    };
  }, [cart, warehouseId]);

  const handleBarcodeSearch = useCallback(async (barcode: string) => {
    setLastScanned(barcode);
    setTimeout(() => setLastScanned(null), 3000);

    // First try to find in already-loaded products (fast path)
    if (products) {
      const found = products.find((p: any) => p.barcode === barcode);
      if (found) {
        addToCart(found);
        toast.success(isAr ? `✅ تم إضافة: ${found.name}` : `✅ Added: ${found.name}`);
        return;
      }
    }
    // Fallback: search by barcode via API (handles products not in current view)
    try {
      const result = await utils.products.getByBarcode.fetch({ barcode });
      if (result) {
        addToCart(result);
        toast.success(isAr ? `✅ تم إضافة: ${result.name}` : `✅ Added: ${result.name}`);
      } else {
        toast.error(isAr ? `❌ لم يُعثر على منتج بالباركود: ${barcode}` : `❌ No product found for barcode: ${barcode}`);
        setSearch(barcode);
        setTimeout(() => setSearch(""), 3000);
      }
    } catch {
      toast.error(isAr ? `❌ لم يُعثر على منتج بالباركود: ${barcode}` : `❌ No product found for barcode: ${barcode}`);
      setSearch(barcode);
      setTimeout(() => setSearch(""), 3000);
    }
  }, [products, isAr, utils, warehouseId]);

  const addToCart = (product: any) => {
    const stock = product.stock?.find((s: any) => s.warehouseId === warehouseId);
    const availableQty = stock?.qty || 0;
    if (availableQty === 0) {
      toast.error(isAr ? "المنتج غير متوفر في المخزون" : "Product out of stock");
      return;
    }
    setCart(prev => {
      const existing = prev.find(i => i.productId === product.id);
      if (existing) {
        if (existing.qty >= availableQty) {
          toast.error(isAr ? "لا يوجد مخزون كافٍ" : "Insufficient stock");
          return prev;
        }
        return prev.map(i => i.productId === product.id
          ? { ...i, qty: i.qty + 1, lineTotal: ((i.qty + 1) * parseFloat(i.unitPrice)).toFixed(2) }
          : i
        );
      }
      return [...prev, {
        productId: product.id,
        productName: product.name,
        productNameEn: product.nameEn,
        barcode: product.barcode,
        color: isAr ? product.color : product.colorEn,
        size: product.size,
        qty: 1,
        unitPrice: product.salePrice,
        discountPct: "0",
        lineTotal: product.salePrice,
        availableQty,
      }];
    });
  };

  const updateQty = (productId: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.productId !== productId) return item;
      const newQty = Math.max(1, Math.min(item.qty + delta, item.availableQty));
      return { ...item, qty: newQty, lineTotal: (newQty * parseFloat(item.unitPrice)).toFixed(2) };
    }));
  };

  const removeItem = (productId: number) => setCart(prev => prev.filter(i => i.productId !== productId));

  // ── Tax calculations ──────────────────────────────────────────────────────
  // priceIncludesTax may come as boolean true/false or as number 1/0 from MySQL
  const priceIncludesTax = !!(settings?.priceIncludesTax) && (settings?.priceIncludesTax as any) !== "0" && (settings?.priceIncludesTax as any) !== 0 && (settings?.priceIncludesTax as any) !== false;
  const taxRate = parseFloat(settings?.taxRate || "0");

  const subtotalBeforeDiscount = cart.reduce((s, i) => s + parseFloat(i.lineTotal), 0);
  const discountAmount = discountType === "percentage"
    ? subtotalBeforeDiscount * (parseFloat(discountValue || "0") / 100)
    : discountType === "fixed" ? parseFloat(discountValue || "0") : 0;
  const afterDiscount = subtotalBeforeDiscount - discountAmount;

  let taxAmount: number;
  let total: number;
  let subtotalDisplay: number; // what to show as "subtotal" (ex-tax)

  if (priceIncludesTax && taxRate > 0) {
    // Prices already include tax → extract tax
    taxAmount = afterDiscount - afterDiscount / (1 + taxRate / 100);
    subtotalDisplay = afterDiscount - taxAmount;
    total = afterDiscount;
  } else {
    // Prices are ex-tax → add tax
    taxAmount = afterDiscount * (taxRate / 100);
    subtotalDisplay = afterDiscount;
    total = afterDiscount + taxAmount;
  }

  const change = parseFloat(receivedAmount || "0") - total;

  // Split payment total
  const splitTotal = paymentSplits.reduce((s, p) => s + parseFloat(p.amount || "0"), 0);
  const splitRemaining = total - splitTotal;

  const handleCompleteSale = async () => {
    if (cart.length === 0) { toast.error(isAr ? "السلة فارغة" : "Cart is empty"); return; }

    // Validate split payment
    if (paymentMode === "split") {
      const filledSplits = paymentSplits.filter(p => parseFloat(p.amount || "0") > 0);
      if (filledSplits.length < 2) {
        toast.error(isAr ? "يجب إدخال مبلغين على الأقل في الدفع المتعدد" : "Enter at least 2 payment amounts");
        return;
      }
      if (Math.abs(splitRemaining) > 0.01) {
        toast.error(isAr ? `المبلغ المتبقي: ${splitRemaining.toFixed(2)} ${currency}` : `Remaining: ${splitRemaining.toFixed(2)} ${currency}`);
        return;
      }
    }

    try {
      const effectiveMethod = paymentMode === "split" ? "mixed" : paymentMethod;
      const result = await createInvoice.mutateAsync({
        customerId: selectedCustomer?.id,
        customerName: selectedCustomer?.name || (isAr ? "عميل عابر" : "Walk-in"),
        customerPhone: selectedCustomer?.phone,
        warehouseId,
        items: cart.map(i => ({
          productId: i.productId,
          productName: i.productName,
          productNameEn: i.productNameEn,
          barcode: i.barcode,
          color: i.color,
          size: i.size,
          qty: i.qty,
          unitPrice: i.unitPrice,
          discountPct: i.discountPct,
          lineTotal: i.lineTotal,
        })),
        subtotal: subtotalDisplay.toFixed(2),
        discountType,
        discountValue: discountValue || "0",
        discountAmount: discountAmount.toFixed(2),
        taxRate: taxRate.toFixed(2),
        taxAmount: taxAmount.toFixed(2),
        total: total.toFixed(2),
        paymentMethod: effectiveMethod as any,
        origin: window.location.origin,
      });
      setCompletedInvoice({
        ...result,
        total: total.toFixed(2),
        subtotal: subtotalDisplay.toFixed(2),
        discountAmount: discountAmount.toFixed(2),
        taxRate: taxRate.toFixed(2),
        taxAmount: taxAmount.toFixed(2),
        createdAt: new Date(),
        customer: selectedCustomer,
        items: cart,
        settings,
      });
      setShowPayDialog(false);

      // If electronic payment, show QR dialog
      if (effectiveMethod === "electronic" && result.mfData?.paymentUrl) {
        setOnlinePayInvoiceId(result.id);
        setOnlinePayQrUrl(result.mfData.qrCode || null);
        setOnlinePayUrl(result.mfData.paymentUrl);
        setOnlinePayStatus("waiting");
        setShowOnlinePayDialog(true);
      } else {
        setShowSuccessDialog(true);
      }

      setCart([]);
      setSelectedCustomer(null);
      setDiscountType("none");
      setDiscountValue("");
      setPaymentMode("single");
      setPaymentMethod("cash");
      setReceivedAmount("");
    } catch (e: any) {
      toast.error(e.message || (isAr ? "حدث خطأ" : "Error occurred"));
    }
  };

  const handleSendWhatsApp = async () => {
    if (!completedInvoice?.id) return;
    const phone = completedInvoice?.customer?.phone || selectedCustomer?.phone;
    if (!phone) { toast.error(isAr ? "لا يوجد رقم هاتف للعميل" : "No customer phone"); return; }
    try {
      await sendWhatsApp.mutateAsync({ invoiceId: completedInvoice.id, phone, origin: window.location.origin });
      toast.success(isAr ? "تم إرسال الفاتورة عبر الواتساب" : "Invoice sent via WhatsApp");
    } catch {
      toast.error(isAr ? "فشل إرسال الواتساب" : "WhatsApp send failed");
    }
  };

  const handlePrintReceipt = () => {
    if (!completedInvoice) return;
    const inv = completedInvoice;
    const storeName = isAr ? (settings?.storeName || "Darin Madani") : (settings?.storeNameEn || settings?.storeName || "Darin Madani");
    const logoUrl = settings?.storeLogo || "/manus-storage/darin-logo-dark_7e882b9c.webp";
    const taxNumber = settings?.taxNumber || "";
    const invoiceTotal = Number(inv.total);
    const invoiceTaxAmount = Number(inv.taxAmount || 0);
    const invoiceDiscountAmount = Number(inv.discountAmount || 0);
    const invoiceTaxRate = Number(inv.taxRate || 0);
    const invoiceDate = inv.createdAt ? new Date(inv.createdAt).toISOString() : new Date().toISOString();

    // Build ZATCA TLV QR
    function buildZATCATLV() {
      function tlv(tag: number, value: string): number[] {
        const enc = new TextEncoder();
        const valBytes = Array.from(enc.encode(String(value)));
        return [tag, valBytes.length, ...valBytes];
      }
      const bytes = [
        ...tlv(1, storeName),
        ...tlv(2, taxNumber),
        ...tlv(3, invoiceDate),
        ...tlv(4, invoiceTotal.toFixed(2)),
        ...tlv(5, invoiceTaxAmount.toFixed(2)),
      ];
      let binary = "";
      bytes.forEach(b => binary += String.fromCharCode(b));
      return btoa(binary);
    }
    const zatcaBase64 = buildZATCATLV();
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(zatcaBase64)}`;

    const printContent = `
      <html dir="${isAr ? "rtl" : "ltr"}">
      <head>
        <meta charset="utf-8">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Courier New', monospace; font-size: 12px; width: 58mm; padding: 4mm; background: #fff; color: #000; }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          .divider { border-top: 1px dashed #000; margin: 4px 0; }
          .row { display: flex; justify-content: space-between; margin: 2px 0; }
          .total-row { font-size: 14px; font-weight: bold; margin: 4px 0; }
          .store-name { font-size: 15px; font-weight: bold; margin: 3px 0 2px; }
          .logo { max-width: 40mm; max-height: 15mm; object-fit: contain; margin-bottom: 4px; }
          .qr-section { display: flex; align-items: flex-start; justify-content: space-between; margin: 4px 0; }
          .qr-img { width: 22mm; height: 22mm; }
          .totals-block { flex: 1; padding-${isAr ? "right" : "left"}: 3mm; }
          .tax-label { font-size: 9px; color: #555; margin-top: 2px; }
        </style>
      </head>
      <body>
        <!-- شعار المتجر -->
        <div class="center">
          <img src="${logoUrl}" class="logo" alt="${storeName}"
            onerror="this.style.display='none'" />
          <div class="store-name">${storeName}</div>
          ${taxNumber ? `<div style="font-size:9px;">الرقم الضريبي: ${taxNumber}</div>` : ""}
          ${settings?.storePhone ? `<div style="font-size:10px;">${settings.storePhone}</div>` : ""}
          ${settings?.storeAddress ? `<div style="font-size:10px;">${settings.storeAddress}</div>` : ""}
        </div>
        <div class="divider"></div>
        <div class="row"><span>${isAr ? "فاتورة رقم" : "Invoice #"}:</span><span class="bold">${inv.invoiceNumber}</span></div>
        <div class="row"><span>${isAr ? "التاريخ" : "Date"}:</span><span>${new Date().toLocaleDateString(isAr ? "ar-SA" : "en-US")}</span></div>
        ${inv.customer ? `<div class="row"><span>${isAr ? "العميل" : "Customer"}:</span><span>${inv.customer.name}</span></div>` : ""}
        <div class="divider"></div>
        ${(inv.items || []).map((item: any) => `
          <div class="bold">${item.productName}</div>
          ${item.color || item.size ? `<div style="font-size:10px;color:#555;">${item.color || ""} ${item.size ? "· " + item.size : ""}</div>` : ""}
          <div class="row">
            <span>${item.qty} × ${Number(item.unitPrice).toLocaleString()}</span>
            <span>${Number(item.lineTotal).toLocaleString()} ${currency}</span>
          </div>
        `).join("")}
        <div class="divider"></div>
        <!-- QR ZATCA والإجماليات -->
        <div class="qr-section">
          <div>
            <img src="${qrUrl}" class="qr-img" alt="QR ZATCA"
              onerror="this.parentElement.innerHTML='<div style=\'font-size:8px;color:#999;\'>QR</div>'" />
            <div class="tax-label center">${isAr ? "رمز ZATCA" : "ZATCA QR"}</div>
          </div>
          <div class="totals-block">
            ${invoiceDiscountAmount > 0 ? `<div class="row"><span>${isAr ? "خصم" : "Disc"}:</span><span>-${invoiceDiscountAmount.toFixed(2)}</span></div>` : ""}
            ${invoiceTaxRate > 0 ? `<div class="row"><span>${isAr ? `ضريبة ${invoiceTaxRate}%` : `Tax ${invoiceTaxRate}%`}:</span><span>${invoiceTaxAmount.toFixed(2)}</span></div>` : ""}
            <div class="row total-row"><span>${isAr ? "الإجمالي" : "Total"}:</span><span>${Number(inv.total).toLocaleString()} ${currency}</span></div>
          </div>
        </div>
        <div class="divider"></div>
        ${settings?.invoiceNote ? `<div class="center" style="font-size:10px;margin-top:3px;">${settings.invoiceNote}</div>` : ""}
        <div class="center" style="margin-top:5px;font-size:10px;">${isAr ? "شكراً لزيارتكم" : "Thank you for your visit"}</div>
        <script>
          window.onload = function() {
            // Wait for QR image to load before printing
            var qrImg = document.querySelector('.qr-img');
            var logo = document.querySelector('.logo');
            var loaded = 0;
            var total = 2;
            function tryPrint() { loaded++; if (loaded >= total) { setTimeout(function() { window.print(); window.close(); }, 300); } }
            if (qrImg) { qrImg.onload = tryPrint; qrImg.onerror = tryPrint; } else { loaded++; }
            if (logo) { logo.onload = tryPrint; logo.onerror = tryPrint; } else { loaded++; }
            if (loaded >= total) tryPrint();
          };
        <\/script>
      </body>
      </html>
    `;
    const win = window.open("", "_blank", "width=300,height=700");
    if (win) {
      win.document.write(printContent);
      win.document.close();
    }
  };

  const paymentMethods = [
    { value: "cash", label: isAr ? "نقدي" : "Cash", icon: <Banknote size={16} /> },
    { value: "card", label: isAr ? "بطاقة" : "Card", icon: <CreditCard size={16} /> },
    { value: "transfer", label: isAr ? "تحويل" : "Transfer", icon: <Smartphone size={16} /> },
    { value: "electronic", label: isAr ? "إلكتروني" : "Electronic", icon: <Zap size={16} /> },
  ];

  return (
    <div className="flex h-full">
      {/* ── Products panel ─────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col border-e border-border overflow-hidden">
        {/* Search & filters */}
        <div className="p-3 border-b border-border space-y-2 bg-card shrink-0">
          {/* Scanner status indicator */}
          <div className={cn(
            "flex items-center gap-2 text-xs px-2 py-1 rounded-md transition-all duration-300",
            scannerActive
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              : "bg-muted/50 text-muted-foreground"
          )}>
            <Barcode size={12} className={scannerActive ? "text-green-600 animate-pulse" : ""} />
            <span>
              {scannerActive
                ? (isAr ? "جاري مسح الباركود..." : "Scanning barcode...")
                : (isAr ? "جاهز لمسح الباركود" : "Ready to scan barcode")
              }
            </span>
            {lastScanned && (
              <span className="ms-auto font-mono text-xs opacity-70">{lastScanned}</span>
            )}
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search size={15} className="absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                ref={searchRef}
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={t("pos.searchProduct")}
                className="ps-9 h-9"
                onKeyDown={e => {
                  // If Enter pressed in search box with value, treat as barcode scan
                  if (e.key === "Enter" && search.trim().length > 2) {
                    e.preventDefault();
                    handleBarcodeSearch(search.trim());
                    setSearch("");
                  }
                }}
              />
            </div>
            <Select value={String(warehouseId)} onValueChange={v => setWarehouseId(parseInt(v))}>
              <SelectTrigger className="w-36 h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(warehouses || []).map((w: any) => (
                  <SelectItem key={w.id} value={String(w.id)}>
                    {isAr ? w.name : (w.nameEn || w.name)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* Category filter */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
            <Button
              variant={categoryFilter === "all" ? "default" : "outline"}
              size="sm" className="h-7 text-xs shrink-0"
              onClick={() => setCategoryFilter("all")}
            >
              {t("common.all")}
            </Button>
            {(categories || []).map((c: any) => (
              <Button
                key={c.id}
                variant={categoryFilter === String(c.id) ? "default" : "outline"}
                size="sm" className="h-7 text-xs shrink-0"
                onClick={() => setCategoryFilter(String(c.id))}
              >
                {isAr ? c.name : (c.nameEn || c.name)}
              </Button>
            ))}
          </div>
        </div>

        {/* Products grid */}
        <ScrollArea className="flex-1 p-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
            {(products || []).map((product: any) => {
              const stock = product.stock?.find((s: any) => s.warehouseId === warehouseId);
              const qty = stock?.qty || 0;
              return (
                <div
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className={cn(
                    "bg-card border border-border rounded-xl p-3 cursor-pointer transition-all duration-150 select-none",
                    "hover:border-primary hover:shadow-md hover:shadow-primary/10",
                    qty === 0 && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {product.images?.[0] ? (
                    <img src={product.images[0]} alt={product.name} className="w-full h-24 object-cover rounded-lg mb-2" />
                  ) : (
                    <div className="w-full h-24 bg-muted rounded-lg mb-2 flex items-center justify-center">
                      <Barcode size={24} className="text-muted-foreground" />
                    </div>
                  )}
                  <p className="text-sm font-medium truncate">{isAr ? product.name : (product.nameEn || product.name)}</p>
                  {(product.color || product.size) && (
                    <p className="text-xs text-muted-foreground truncate">
                      {isAr ? product.color : product.colorEn} {product.size && `· ${product.size}`}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-1.5">
                    <div>
                      <span className="text-sm font-bold text-primary">{Number(product.salePrice).toLocaleString()} {currency}</span>
                      {priceIncludesTax && taxRate > 0 && (
                        <p className="text-[10px] text-muted-foreground">{isAr ? "شامل الضريبة" : "Tax incl."}</p>
                      )}
                    </div>
                    <Badge variant={qty === 0 ? "destructive" : qty <= (product.lowStockAlert || 5) ? "secondary" : "outline"} className="text-xs">
                      {qty}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
          {(!products || products.length === 0) && (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Package size={40} className="mb-3 opacity-30" />
              <p>{t("common.noData")}</p>
            </div>
          )}
        </ScrollArea>
      </div>

      {/* ── Cart panel ─────────────────────────────────────────────────── */}
      <div className="w-80 xl:w-96 flex flex-col bg-card overflow-hidden">
        {/* Customer selector */}
        <div className="p-3 border-b border-border shrink-0">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <div
                className="flex items-center gap-2 h-9 px-3 rounded-lg border border-input bg-background cursor-pointer"
                onClick={() => setShowCustomerDropdown(!showCustomerDropdown)}
              >
                <User size={14} className="text-muted-foreground shrink-0" />
                <span className="text-sm flex-1 truncate">
                  {selectedCustomer ? selectedCustomer.name : t("pos.walkIn")}
                </span>
                {selectedCustomer && (
                  <button
                    onClick={e => { e.stopPropagation(); setSelectedCustomer(null); }}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <X size={12} />
                  </button>
                )}
                {!selectedCustomer && <ChevronDown size={14} className="text-muted-foreground shrink-0" />}
              </div>
              {showCustomerDropdown && (
                <div className="absolute top-full start-0 end-0 z-50 bg-popover border border-border rounded-lg shadow-lg mt-1">
                  <div className="p-2">
                    <Input
                      value={customerSearch}
                      onChange={e => setCustomerSearch(e.target.value)}
                      placeholder={isAr ? "ابحث عن عميل..." : "Search customer..."}
                      className="h-8 text-sm"
                      autoFocus
                    />
                  </div>
                  <ScrollArea className="max-h-48">
                    <div
                      className="px-3 py-2 text-sm cursor-pointer hover:bg-accent"
                      onClick={() => { setSelectedCustomer(null); setShowCustomerDropdown(false); setCustomerSearch(""); }}
                    >
                      {t("pos.walkIn")}
                    </div>
                    {(customers || []).map((c: any) => (
                      <div
                        key={c.id}
                        className="px-3 py-2 text-sm cursor-pointer hover:bg-accent"
                        onClick={() => { setSelectedCustomer(c); setShowCustomerDropdown(false); setCustomerSearch(""); }}
                      >
                        <p className="font-medium">{c.name}</p>
                        {c.phone && <p className="text-xs text-muted-foreground">{c.phone}</p>}
                      </div>
                    ))}
                    {customerSearch.length > 0 && (customers || []).length === 0 && (
                      <div className="px-3 py-2 text-xs text-muted-foreground text-center">
                        {isAr ? "لا توجد نتائج" : "No results"}
                      </div>
                    )}
                  </ScrollArea>
                </div>
              )}
            </div>
            {/* Quick add customer button */}
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 shrink-0"
              title={isAr ? "إضافة عميل جديد" : "Add new customer"}
              onClick={() => { setShowCustomerDropdown(false); setShowQuickCustomer(true); }}
            >
              <UserPlus size={15} />
            </Button>
          </div>
        </div>

        {/* Cart items */}
        <ScrollArea className="flex-1 p-3">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
              <ShoppingCart size={32} className="mb-2 opacity-30" />
              <p className="text-sm">{t("pos.emptyCart")}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {cart.map(item => (
                <div key={item.productId} className="bg-background rounded-lg p-2.5 border border-border">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.productName}</p>
                      {(item.color || item.size) && (
                        <p className="text-xs text-muted-foreground">{item.color} {item.size && `· ${item.size}`}</p>
                      )}
                    </div>
                    <button onClick={() => removeItem(item.productId)} className="text-muted-foreground hover:text-destructive shrink-0">
                      <X size={14} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1">
                      <button onClick={() => updateQty(item.productId, -1)}
                        className="w-6 h-6 rounded-full border border-border flex items-center justify-center hover:bg-accent">
                        <Minus size={10} />
                      </button>
                      <span className="w-8 text-center text-sm font-medium">{item.qty}</span>
                      <button onClick={() => updateQty(item.productId, 1)}
                        className="w-6 h-6 rounded-full border border-border flex items-center justify-center hover:bg-accent">
                        <Plus size={10} />
                      </button>
                    </div>
                    <span className="text-sm font-bold text-primary">{Number(item.lineTotal).toLocaleString()} {currency}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Discount */}
        {cart.length > 0 && (
          <div className="px-3 pb-2 shrink-0">
            <div className="flex gap-2">
              <Select value={discountType} onValueChange={(v: any) => setDiscountType(v)}>
                <SelectTrigger className="h-8 text-xs flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{isAr ? "بدون خصم" : "No discount"}</SelectItem>
                  <SelectItem value="percentage">% {t("common.discount")}</SelectItem>
                  <SelectItem value="fixed">{currency} {t("common.discount")}</SelectItem>
                </SelectContent>
              </Select>
              {discountType !== "none" && (
                <Input
                  value={discountValue}
                  onChange={e => setDiscountValue(e.target.value)}
                  placeholder="0"
                  className="h-8 text-xs w-20"
                  type="number"
                />
              )}
            </div>
          </div>
        )}

        {/* Totals */}
        <div className="border-t border-border p-3 space-y-1.5 shrink-0">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t("common.subtotal")}</span>
            <span>{subtotalDisplay.toFixed(2)} {currency}</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>{t("common.discount")}</span>
              <span>- {discountAmount.toFixed(2)} {currency}</span>
            </div>
          )}
          {taxRate > 0 && (
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>
                {t("common.tax")} ({taxRate}%)
                {priceIncludesTax && <span className="text-xs ms-1 text-amber-600">{isAr ? "مشمول" : "incl."}</span>}
              </span>
              <span>{taxAmount.toFixed(2)} {currency}</span>
            </div>
          )}
          <Separator />
          <div className="flex justify-between font-bold text-lg">
            <span>{t("common.total")}</span>
            <span className="text-primary">{total.toFixed(2)} {currency}</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="p-3 pt-0 space-y-2 shrink-0">
          <Button
            className="w-full gap-2"
            size="lg"
            disabled={cart.length === 0}
            onClick={() => setShowPayDialog(true)}
          >
            <CreditCard size={18} />
            {t("pos.payment")}
          </Button>
          <Button variant="outline" className="w-full" size="sm" onClick={() => setCart([])}>
            <Trash2 size={14} className="me-2" />
            {t("pos.clear")}
          </Button>
        </div>
      </div>

      {/* ── Payment Dialog ─────────────────────────────────────────────── */}
      <Dialog open={showPayDialog} onOpenChange={setShowPayDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("pos.payment")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Payment mode toggle */}
            <div className="flex gap-2">
              <Button
                variant={paymentMode === "single" ? "default" : "outline"}
                size="sm" className="flex-1 gap-1"
                onClick={() => setPaymentMode("single")}
              >
                <CreditCard size={14} />
                {isAr ? "دفعة واحدة" : "Single Payment"}
              </Button>
              <Button
                variant={paymentMode === "split" ? "default" : "outline"}
                size="sm" className="flex-1 gap-1"
                onClick={() => setPaymentMode("split")}
              >
                <SplitSquareHorizontal size={14} />
                {isAr ? "دفع متعدد" : "Split Payment"}
              </Button>
            </div>

            {paymentMode === "single" ? (
              <>
                <div>
                  <Label className="text-sm mb-2 block">{t("pos.paymentMethod")}</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {paymentMethods.map(m => (
                      <button
                        key={m.value}
                        onClick={() => setPaymentMethod(m.value as any)}
                        className={cn(
                          "flex items-center gap-2 p-3 rounded-lg border text-sm font-medium transition-all",
                          paymentMethod === m.value
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        {m.icon} {m.label}
                      </button>
                    ))}
                  </div>
                </div>
                {paymentMethod === "cash" && (
                  <div>
                    <Label className="text-sm">{t("pos.received")}</Label>
                    <Input
                      value={receivedAmount}
                      onChange={e => setReceivedAmount(e.target.value)}
                      placeholder={total.toFixed(2)}
                      type="number"
                      className="mt-1"
                    />
                    {change > 0 && (
                      <p className="text-sm text-green-600 mt-1 font-medium">
                        {t("pos.change")}: {change.toFixed(2)} {currency}
                      </p>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-3">
                <Label className="text-sm">{isAr ? "توزيع المبلغ على طرق الدفع" : "Distribute amount across payment methods"}</Label>
                {paymentSplits.map((split, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <Select
                      value={split.method}
                      onValueChange={v => setPaymentSplits(prev => prev.map((p, i) => i === idx ? { ...p, method: v as any } : p))}
                    >
                      <SelectTrigger className="w-36 h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {paymentMethods.map(m => (
                          <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={split.amount}
                      onChange={e => setPaymentSplits(prev => prev.map((p, i) => i === idx ? { ...p, amount: e.target.value } : p))}
                      className="flex-1 h-9"
                    />
                    {paymentSplits.length > 2 && (
                      <button onClick={() => setPaymentSplits(prev => prev.filter((_, i) => i !== idx))} className="text-destructive">
                        <X size={14} />
                      </button>
                    )}
                  </div>
                ))}
                <Button
                  variant="outline" size="sm" className="gap-1"
                  onClick={() => setPaymentSplits(prev => [...prev, { method: "cash", amount: "" }])}
                >
                  <Plus size={12} />
                  {isAr ? "إضافة طريقة دفع" : "Add payment method"}
                </Button>
                <div className={cn(
                  "text-sm font-medium p-2 rounded-lg",
                  Math.abs(splitRemaining) < 0.01 ? "bg-green-50 text-green-700 dark:bg-green-900/20" : "bg-amber-50 text-amber-700 dark:bg-amber-900/20"
                )}>
                  {Math.abs(splitRemaining) < 0.01
                    ? (isAr ? "✓ المبالغ متطابقة" : "✓ Amounts match")
                    : `${isAr ? "المتبقي" : "Remaining"}: ${splitRemaining.toFixed(2)} ${currency}`
                  }
                </div>
              </div>
            )}

            {/* Summary */}
            <div className="bg-muted rounded-lg p-3 space-y-1">
              <div className="flex justify-between text-sm">
                <span>{t("common.subtotal")}</span><span>{subtotalDisplay.toFixed(2)} {currency}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>{t("common.discount")}</span><span>- {discountAmount.toFixed(2)} {currency}</span>
                </div>
              )}
              {taxRate > 0 && (
                <div className="flex justify-between text-sm">
                  <span>{t("common.tax")} ({taxRate}%){priceIncludesTax ? (isAr ? " - مشمول" : " - incl.") : ""}</span>
                  <span>{taxAmount.toFixed(2)} {currency}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-base border-t border-border pt-1 mt-1">
                <span>{t("common.total")}</span>
                <span className="text-primary">{total.toFixed(2)} {currency}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPayDialog(false)}>{t("common.cancel")}</Button>
            <Button onClick={handleCompleteSale} disabled={createInvoice.isPending} className="gap-2">
              <CheckCircle size={16} />
              {createInvoice.isPending ? t("common.loading") : t("pos.complete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Success Dialog ─────────────────────────────────────────────── */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="max-w-sm text-center">
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle size={32} className="text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold">{t("pos.saleComplete")}</h3>
              <p className="text-sm text-muted-foreground mt-1">{completedInvoice?.invoiceNumber}</p>
              <p className="text-2xl font-bold text-primary mt-2">{completedInvoice?.total} {currency}</p>
            </div>
            <div className="flex gap-2 w-full">
              <Button variant="outline" className="flex-1 gap-2" onClick={handlePrintReceipt}>
                <Printer size={14} />
                {t("pos.printReceipt")}
              </Button>
              <Button
                variant="outline"
                className="flex-1 gap-2 text-green-600 border-green-200 hover:bg-green-50"
                onClick={handleSendWhatsApp}
                disabled={sendWhatsApp.isPending}
              >
                <MessageCircle size={14} />
                {t("pos.sendWhatsApp")}
              </Button>
            </div>
            <Button className="w-full" onClick={() => setShowSuccessDialog(false)}>
              {isAr ? "فاتورة جديدة" : "New Sale"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Quick Add Customer Dialog ──────────────────────────────────── */}
      <Dialog open={showQuickCustomer} onOpenChange={setShowQuickCustomer}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus size={18} />
              {isAr ? "إضافة عميل جديد" : "Add New Customer"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>{isAr ? "الاسم *" : "Name *"}</Label>
              <Input
                value={quickCustomerForm.name}
                onChange={e => setQuickCustomerForm(f => ({ ...f, name: e.target.value }))}
                placeholder={isAr ? "اسم العميل" : "Customer name"}
                autoFocus
              />
            </div>
            <div className="space-y-1">
              <Label>{isAr ? "رقم الجوال" : "Phone"}</Label>
              <Input
                value={quickCustomerForm.phone}
                onChange={e => setQuickCustomerForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="05xxxxxxxx"
                dir="ltr"
                type="tel"
              />
            </div>
            <div className="space-y-1">
              <Label>{isAr ? "البريد الإلكتروني" : "Email"}</Label>
              <Input
                value={quickCustomerForm.email}
                onChange={e => setQuickCustomerForm(f => ({ ...f, email: e.target.value }))}
                placeholder="email@example.com"
                dir="ltr"
                type="email"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowQuickCustomer(false)}>{t("common.cancel")}</Button>
            <Button
              onClick={() => {
                if (!quickCustomerForm.name.trim()) { toast.error(isAr ? "يرجى إدخال الاسم" : "Name required"); return; }
                createCustomer.mutate(quickCustomerForm);
              }}
              disabled={createCustomer.isPending}
            >
              {createCustomer.isPending ? t("common.loading") : t("common.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Barcode Label Print */}
      {showPrintLabel && (
        <BarcodeLabel product={showPrintLabel} onClose={() => setShowPrintLabel(null)} />
      )}

      {/* ── Online Payment QR Dialog ──────────────────────────── */}
      <OnlinePaymentDialog
        open={showOnlinePayDialog}
        onOpenChange={setShowOnlinePayDialog}
        invoiceId={onlinePayInvoiceId}
        qrUrl={onlinePayQrUrl}
        paymentUrl={onlinePayUrl}
        status={onlinePayStatus}
        onStatusChange={setOnlinePayStatus}
        onPaidConfirmed={() => setShowSuccessDialog(true)}
        completedInvoice={completedInvoice}
        settings={settings}
        isAr={isAr}
      />
    </div>
  );
}
