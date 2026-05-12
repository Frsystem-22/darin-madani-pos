import { useState } from "react";
import { useTranslation } from "react-i18next";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, RotateCcw, FileText, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { ar, enUS } from "date-fns/locale";

export default function Returns() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const locale = isAr ? ar : enUS;
  const currency = isAr ? "ر.س" : "SAR";

  const [invoiceSearch, setInvoiceSearch] = useState("");
  const [foundInvoice, setFoundInvoice] = useState<any>(null);
  const [selectedItems, setSelectedItems] = useState<Record<number, { selected: boolean; qty: number }>>({});
  const [reason, setReason] = useState("");
  const [warehouseId, setWarehouseId] = useState("1");
  const [showConfirm, setShowConfirm] = useState(false);

  const { data: warehouses } = trpc.settings.getWarehouses.useQuery();
  const { data: returns, refetch } = trpc.invoices.listReturns.useQuery({});
  const utils = trpc.useUtils();

  const searchInvoice = trpc.invoices.list.useQuery(
    { search: invoiceSearch || undefined },
    { enabled: false }
  );

  const doSearchInvoice = async () => {
    if (!invoiceSearch) return;
    try {
      const results = await utils.invoices.list.fetch({ search: invoiceSearch });
      if (results && results.length > 0) {
        const data = results[0];
        setFoundInvoice(data);
        const init: Record<number, { selected: boolean; qty: number }> = {};
        (data as any).items?.forEach((item: any) => { init[item.id] = { selected: false, qty: item.qty }; });
        setSelectedItems(init);
      } else {
        toast.error(isAr ? "لم يتم العثور على الفاتورة" : "Invoice not found");
      }
    } catch {
      toast.error(isAr ? "خطأ في البحث" : "Search error");
    }
  };

  const createReturn = trpc.invoices.createReturn.useMutation({
    onSuccess: () => {
      refetch();
      setFoundInvoice(null);
      setInvoiceSearch("");
      setSelectedItems({});
      setReason("");
      setShowConfirm(false);
      toast.success(isAr ? "تم إنشاء المرتجع بنجاح" : "Return created successfully");
    },
    onError: (e) => toast.error(e.message),
  });

  const toggleItem = (itemId: number) => {
    setSelectedItems(prev => ({
      ...prev,
      [itemId]: { ...prev[itemId], selected: !prev[itemId]?.selected },
    }));
  };

  const updateQty = (itemId: number, qty: number) => {
    setSelectedItems(prev => ({ ...prev, [itemId]: { ...prev[itemId], qty } }));
  };

  const selectedCount = Object.values(selectedItems).filter(i => i.selected).length;
  const returnTotal = foundInvoice?.items
    ?.filter((item: any) => selectedItems[item.id]?.selected)
    .reduce((sum: number, item: any) => {
      const qty = selectedItems[item.id]?.qty || item.qty;
      return sum + (Number(item.unitPrice) * qty);
    }, 0) || 0;

  const handleReturn = async () => {
    const items = foundInvoice.items
      .filter((item: any) => selectedItems[item.id]?.selected)
      .map((item: any) => ({
        invoiceItemId: item.id,
        productId: item.productId,
        qty: selectedItems[item.id]?.qty || item.qty,
        unitPrice: item.unitPrice,
      }));
    if (items.length === 0) { toast.error(isAr ? "يرجى اختيار منتج واحد على الأقل" : "Select at least one item"); return; }
    await createReturn.mutateAsync({
      invoiceId: foundInvoice.id,
      invoiceNumber: foundInvoice.invoiceNumber,
      customerId: foundInvoice.customerId,
      customerName: foundInvoice.customerName,
      warehouseId: parseInt(warehouseId),
      reason,
      refundAmount: returnTotal.toFixed(2),
      refundMethod: "cash",
      items: items.map((i: any) => ({
        productId: i.productId,
        productName: i.productName || "",
        barcode: i.barcode,
        color: i.color,
        size: i.size,
        qty: i.qty,
        unitPrice: String(i.unitPrice),
        lineTotal: String(Number(i.unitPrice) * i.qty),
      })),
    });
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">{t("returns.title")}</h1>

      {/* Search invoice */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-3">
            <Label className="text-sm font-medium">{isAr ? "البحث عن فاتورة" : "Search Invoice"}</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search size={15} className="absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={invoiceSearch}
                  onChange={e => setInvoiceSearch(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && doSearchInvoice()}
                  placeholder={isAr ? "رقم الفاتورة..." : "Invoice number..."}
                  className="ps-9"
                />
              </div>
              <Button onClick={doSearchInvoice} disabled={!invoiceSearch}>
                {t("common.search")}
              </Button>
            </div>
          </div>

          {/* Found invoice */}
          {foundInvoice && (
            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <p className="font-medium">{foundInvoice.invoiceNumber}</p>
                  <p className="text-sm text-muted-foreground">
                    {foundInvoice.customerName || (isAr ? "عميل عابر" : "Walk-in")} ·
                    {format(new Date(foundInvoice.createdAt), " dd/MM/yyyy", { locale })}
                  </p>
                </div>
                <Badge variant="default">{Number(foundInvoice.total).toLocaleString()} {currency}</Badge>
              </div>

              {foundInvoice.status === "cancelled" && (
                <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
                  <AlertCircle size={16} />
                  {isAr ? "هذه الفاتورة ملغاة ولا يمكن إرجاعها" : "This invoice is cancelled and cannot be returned"}
                </div>
              )}

              {foundInvoice.status !== "cancelled" && (
                <>
                  <div className="space-y-2">
                    <Label className="text-sm">{isAr ? "اختر المنتجات المرتجعة" : "Select items to return"}</Label>
                    {foundInvoice.items?.map((item: any) => (
                      <div key={item.id} className="flex items-center gap-3 p-3 border border-border rounded-lg">
                        <Checkbox
                          checked={selectedItems[item.id]?.selected || false}
                          onCheckedChange={() => toggleItem(item.id)}
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{isAr ? item.productName : (item.productNameEn || item.productName)}</p>
                          {(item.color || item.size) && (
                            <p className="text-xs text-muted-foreground">{item.color}{item.size && ` · ${item.size}`}</p>
                          )}
                          <p className="text-xs text-muted-foreground">{Number(item.unitPrice).toLocaleString()} {currency} × {item.qty}</p>
                        </div>
                        {selectedItems[item.id]?.selected && (
                          <div className="flex items-center gap-1">
                            <Label className="text-xs">{isAr ? "الكمية:" : "Qty:"}</Label>
                            <Input
                              type="number" min="1" max={item.qty}
                              value={selectedItems[item.id]?.qty || item.qty}
                              onChange={e => updateQty(item.id, Math.min(parseInt(e.target.value) || 1, item.qty))}
                              className="w-16 h-7 text-xs"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label>{t("warehouse.title")}</Label>
                      <Select value={warehouseId} onValueChange={setWarehouseId}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {(warehouses || []).map((w: any) => (
                            <SelectItem key={w.id} value={String(w.id)}>{isAr ? w.name : (w.nameEn || w.name)}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label>{isAr ? "سبب الإرجاع" : "Return Reason"}</Label>
                      <Input value={reason} onChange={e => setReason(e.target.value)} placeholder={isAr ? "سبب الإرجاع..." : "Reason..."} />
                    </div>
                  </div>

                  {selectedCount > 0 && (
                    <div className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                      <span className="text-sm font-medium">{isAr ? `إجمالي المرتجع (${selectedCount} منتج)` : `Return total (${selectedCount} items)`}</span>
                      <span className="font-bold text-amber-700 dark:text-amber-400">{returnTotal.toFixed(2)} {currency}</span>
                    </div>
                  )}

                  <Button
                    className="w-full gap-2"
                    disabled={selectedCount === 0 || createReturn.isPending}
                    onClick={() => setShowConfirm(true)}
                  >
                    <RotateCcw size={16} />
                    {isAr ? "تأكيد الإرجاع" : "Confirm Return"}
                  </Button>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Returns history */}
      <div>
        <h2 className="text-lg font-semibold mb-3">{isAr ? "سجل المرتجعات" : "Returns History"}</h2>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{isAr ? "رقم المرتجع" : "Return #"}</TableHead>
                  <TableHead>{isAr ? "الفاتورة" : "Invoice"}</TableHead>
                  <TableHead>{t("customers.name")}</TableHead>
                  <TableHead>{t("common.date")}</TableHead>
                  <TableHead>{isAr ? "المبلغ المرتجع" : "Return Amount"}</TableHead>
                  <TableHead>{isAr ? "السبب" : "Reason"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(returns || []).map((r: any) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-mono text-sm">{r.returnNumber}</TableCell>
                    <TableCell className="font-mono text-sm text-muted-foreground">{r.invoiceNumber}</TableCell>
                    <TableCell className="text-sm">{r.customerName || (isAr ? "عميل عابر" : "Walk-in")}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(r.createdAt), "dd/MM/yyyy", { locale })}
                    </TableCell>
                    <TableCell className="font-medium text-amber-600">{Number(r.totalRefund).toLocaleString()} {currency}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{r.reason || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {(!returns || returns.length === 0) && (
              <div className="py-12 text-center text-muted-foreground">
                <RotateCcw size={32} className="mx-auto mb-2 opacity-30" />
                <p>{t("common.noData")}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Confirm Dialog */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{isAr ? "تأكيد الإرجاع" : "Confirm Return"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {isAr
                ? `سيتم إرجاع ${selectedCount} منتج بقيمة ${returnTotal.toFixed(2)} ${currency} وإعادتها للمخزون.`
                : `${selectedCount} item(s) worth ${returnTotal.toFixed(2)} ${currency} will be returned to stock.`}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirm(false)}>{t("common.cancel")}</Button>
            <Button onClick={handleReturn} disabled={createReturn.isPending} className="gap-2">
              <RotateCcw size={14} />
              {isAr ? "تأكيد" : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
