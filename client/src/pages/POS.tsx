import { useState, useRef, useCallback, useEffect } from "react";
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
  Search, ShoppingCart, Trash2, Plus, Minus, User, Tag,
  CreditCard, Banknote, Smartphone, Zap, CheckCircle,
  MessageCircle, Printer, X, Barcode, ChevronDown, Package
} from "lucide-react";
import { cn } from "@/lib/utils";
// InvoicePrint will be imported after creation
// import InvoicePrint from "@/components/InvoicePrint";

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
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "transfer" | "electronic">("cash");
  const [discountType, setDiscountType] = useState<"none" | "percentage" | "fixed">("none");
  const [discountValue, setDiscountValue] = useState("");
  const [receivedAmount, setReceivedAmount] = useState("");
  const [showPayDialog, setShowPayDialog] = useState(false);
  const [completedInvoice, setCompletedInvoice] = useState<any>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showPrintDialog, setShowPrintDialog] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const { data: products } = trpc.products.list.useQuery({ search: search || undefined, categoryId: categoryFilter !== "all" ? parseInt(categoryFilter) : undefined });
  const { data: categories } = trpc.settings.getCategories.useQuery();
  const { data: warehouses } = trpc.settings.getWarehouses.useQuery();
  const { data: customers } = trpc.customers.list.useQuery({ search: customerSearch || undefined }, { enabled: customerSearch.length > 0 || showCustomerDropdown });
  const { data: settings } = trpc.settings.get.useQuery();

  const createInvoice = trpc.invoices.create.useMutation();
  const sendWhatsApp = trpc.invoices.sendWhatsApp.useMutation();

  // Barcode scan handler
  useEffect(() => {
    let buffer = "";
    let lastKey = 0;
    const handler = (e: KeyboardEvent) => {
      const now = Date.now();
      if (now - lastKey > 300) buffer = "";
      lastKey = now;
      if (e.key === "Enter" && buffer.length > 3) {
        handleBarcodeSearch(buffer);
        buffer = "";
      } else if (e.key.length === 1) {
        buffer += e.key;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [cart, warehouseId]);

  const handleBarcodeSearch = useCallback(async (barcode: string) => {
    setSearch(barcode);
    setTimeout(() => setSearch(""), 2000);
  }, []);

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

  const subtotal = cart.reduce((s, i) => s + parseFloat(i.lineTotal), 0);
  const taxRate = parseFloat(settings?.taxRate || "0");
  const discountAmount = discountType === "percentage"
    ? subtotal * (parseFloat(discountValue || "0") / 100)
    : discountType === "fixed" ? parseFloat(discountValue || "0") : 0;
  const taxableAmount = subtotal - discountAmount;
  const taxAmount = taxableAmount * (taxRate / 100);
  const total = taxableAmount + taxAmount;
  const change = parseFloat(receivedAmount || "0") - total;

  const handleCompleteSale = async () => {
    if (cart.length === 0) { toast.error(isAr ? "السلة فارغة" : "Cart is empty"); return; }
    try {
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
        subtotal: subtotal.toFixed(2),
        discountType,
        discountValue: discountValue || "0",
        discountAmount: discountAmount.toFixed(2),
        taxRate: taxRate.toFixed(2),
        taxAmount: taxAmount.toFixed(2),
        total: total.toFixed(2),
        paymentMethod,
        origin: window.location.origin,
      });
      setCompletedInvoice({ ...result, total: total.toFixed(2), customer: selectedCustomer, items: cart, settings });
      setShowPayDialog(false);
      setShowSuccessDialog(true);
      setCart([]);
      setSelectedCustomer(null);
      setDiscountType("none");
      setDiscountValue("");
    } catch (e: any) {
      toast.error(e.message || (isAr ? "حدث خطأ" : "Error occurred"));
    }
  };

  const handleSendWhatsApp = async () => {
    if (!completedInvoice || !selectedCustomer?.phone) return;
    try {
      await sendWhatsApp.mutateAsync({ invoiceId: completedInvoice.id, phone: selectedCustomer.phone });
      toast.success(isAr ? "تم إرسال الفاتورة عبر الواتساب" : "Invoice sent via WhatsApp");
    } catch {
      toast.error(isAr ? "فشل إرسال الواتساب" : "WhatsApp send failed");
    }
  };

  return (
    <div className="flex h-full">
      {/* Products panel */}
      <div className="flex-1 flex flex-col border-e border-border">
        {/* Search & filters */}
        <div className="p-3 border-b border-border space-y-2 bg-card">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search size={15} className="absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                ref={searchRef}
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={t("pos.searchProduct")}
                className="ps-9 h-9"
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
          <div className="flex gap-1.5 overflow-x-auto pb-1">
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
                    "bg-card border border-border rounded-xl p-3 cursor-pointer transition-all duration-150",
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
                  {product.color && <p className="text-xs text-muted-foreground">{isAr ? product.color : product.colorEn} {product.size && `· ${product.size}`}</p>}
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-sm font-bold text-primary">{Number(product.salePrice).toLocaleString()} {currency}</span>
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

      {/* Cart panel */}
      <div className="w-80 xl:w-96 flex flex-col bg-card">
        {/* Customer */}
        <div className="p-3 border-b border-border">
          <div className="relative">
            <div className="flex items-center gap-2 h-9 px-3 rounded-lg border border-input bg-background cursor-pointer"
              onClick={() => setShowCustomerDropdown(!showCustomerDropdown)}>
              <User size={14} className="text-muted-foreground" />
              <span className="text-sm flex-1 truncate">
                {selectedCustomer ? selectedCustomer.name : t("pos.walkIn")}
              </span>
              <ChevronDown size={14} className="text-muted-foreground" />
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
                </ScrollArea>
              </div>
            )}
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
                    <button onClick={() => removeItem(item.productId)} className="text-muted-foreground hover:text-destructive">
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
          <div className="px-3 pb-2">
            <div className="flex gap-2">
              <Select value={discountType} onValueChange={(v: any) => setDiscountType(v)}>
                <SelectTrigger className="h-8 text-xs flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t("common.discount")}</SelectItem>
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
        <div className="border-t border-border p-3 space-y-1.5">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t("common.subtotal")}</span>
            <span>{subtotal.toLocaleString()} {currency}</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>{t("common.discount")}</span>
              <span>- {discountAmount.toFixed(2)} {currency}</span>
            </div>
          )}
          {taxRate > 0 && (
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{t("common.tax")} ({taxRate}%)</span>
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
        <div className="p-3 pt-0 space-y-2">
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

      {/* Payment Dialog */}
      <Dialog open={showPayDialog} onOpenChange={setShowPayDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("pos.payment")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm mb-2 block">{t("pos.paymentMethod")}</Label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: "cash", label: t("pos.cash"), icon: <Banknote size={16} /> },
                  { value: "card", label: t("pos.card"), icon: <CreditCard size={16} /> },
                  { value: "transfer", label: t("pos.transfer"), icon: <Smartphone size={16} /> },
                  { value: "electronic", label: t("pos.electronic"), icon: <Zap size={16} /> },
                ].map(m => (
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
            <div className="bg-muted rounded-lg p-3 space-y-1">
              <div className="flex justify-between text-sm">
                <span>{t("common.subtotal")}</span><span>{subtotal.toFixed(2)} {currency}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>{t("common.discount")}</span><span>- {discountAmount.toFixed(2)} {currency}</span>
                </div>
              )}
              {taxRate > 0 && (
                <div className="flex justify-between text-sm">
                  <span>{t("common.tax")}</span><span>{taxAmount.toFixed(2)} {currency}</span>
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

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="max-w-sm text-center">
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle size={32} className="text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold">{t("pos.saleComplete")}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {completedInvoice?.invoiceNumber}
              </p>
              <p className="text-2xl font-bold text-primary mt-2">
                {completedInvoice?.total} {currency}
              </p>
            </div>
            <div className="flex gap-2 w-full">
              <Button variant="outline" className="flex-1 gap-2" onClick={() => { setShowSuccessDialog(false); setShowPrintDialog(true); }}>
                <Printer size={14} />
                {t("pos.printReceipt")}
              </Button>
              {selectedCustomer?.phone && (
                <Button variant="outline" className="flex-1 gap-2 text-green-600 border-green-200" onClick={handleSendWhatsApp}>
                  <MessageCircle size={14} />
                  {t("pos.sendWhatsApp")}
                </Button>
              )}
            </div>
            <Button className="w-full" onClick={() => setShowSuccessDialog(false)}>
              {isAr ? "فاتورة جديدة" : "New Sale"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Print Dialog */}
      {/* Print dialog placeholder - InvoicePrint component */}
      {showPrintDialog && (
        <Dialog open={showPrintDialog} onOpenChange={setShowPrintDialog}>
          <DialogContent>
            <DialogHeader><DialogTitle>{t("invoices.printInvoice")}</DialogTitle></DialogHeader>
            <p className="text-sm text-muted-foreground text-center py-4">{completedInvoice?.invoiceNumber}</p>
            <DialogFooter>
              <Button onClick={() => { window.print(); setShowPrintDialog(false); }}>{t("common.print")}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
