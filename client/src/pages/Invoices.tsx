import { useState } from "react";
import { useTranslation } from "react-i18next";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Search, Eye, Printer, MessageCircle, RotateCcw, FileText, X } from "lucide-react";
import { format } from "date-fns";
import { ar, enUS } from "date-fns/locale";

export default function Invoices() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const locale = isAr ? ar : enUS;
  const currency = isAr ? "ر.س" : "SAR";

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [showDetail, setShowDetail] = useState(false);

  const { data: invoices, refetch } = trpc.invoices.list.useQuery({
    search: search || undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
  });

  const sendWhatsApp = trpc.invoices.sendWhatsApp.useMutation({
    onSuccess: () => toast.success(isAr ? "✅ تم إرسال الفاتورة عبر الواتساب" : "✅ Invoice sent via WhatsApp"),
    onError: (err: any) => toast.error(err?.message || (isAr ? "❌ فشل إرسال الواتساب" : "❌ WhatsApp send failed")),
  });

  const cancelInvoice = trpc.invoices.cancel.useMutation({
    onSuccess: () => { refetch(); setShowDetail(false); toast.success(isAr ? "تم إلغاء الفاتورة" : "Invoice cancelled"); },
  });

  const statusBadge = (status: string) => {
    const map: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      completed: { label: isAr ? "مكتملة" : "Completed", variant: "default" },
      pending: { label: isAr ? "معلقة" : "Pending", variant: "secondary" },
      cancelled: { label: isAr ? "ملغاة" : "Cancelled", variant: "destructive" },
      returned: { label: isAr ? "مرتجعة" : "Returned", variant: "outline" },
    };
    const s = map[status] || { label: status, variant: "outline" as const };
    return <Badge variant={s.variant}>{s.label}</Badge>;
  };

  const paymentLabel = (method: string) => {
    const map: Record<string, string> = {
      cash: isAr ? "نقدي" : "Cash",
      card: isAr ? "بطاقة" : "Card",
      transfer: isAr ? "تحويل" : "Transfer",
      electronic: isAr ? "إلكتروني" : "Electronic",
    };
    return map[method] || method;
  };

  const handlePrint = (invoice: any) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    const items = invoice.items || [];
    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="${isAr ? "rtl" : "ltr"}">
      <head>
        <meta charset="UTF-8">
        <title>Invoice ${invoice.invoiceNumber}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Arial', sans-serif; font-size: 11px; width: 80mm; margin: 0 auto; }
          .header { text-align: center; padding: 4mm 0; border-bottom: 1px dashed #000; }
          .store-name { font-size: 14px; font-weight: bold; letter-spacing: 1px; }
          .sub { font-size: 9px; color: #555; }
          .section { padding: 2mm 0; border-bottom: 1px dashed #000; }
          .row { display: flex; justify-content: space-between; margin: 1mm 0; }
          .items-table { width: 100%; border-collapse: collapse; margin: 2mm 0; }
          .items-table th, .items-table td { padding: 1mm; font-size: 10px; }
          .items-table th { border-bottom: 1px solid #000; font-weight: bold; }
          .total-row { font-weight: bold; font-size: 13px; }
          .footer { text-align: center; padding: 3mm 0; font-size: 9px; color: #555; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="store-name">DARIN MADANI</div>
          <div class="sub">FASHION HOUSE</div>
          <div class="sub" style="margin-top:2mm">${invoice.invoiceNumber}</div>
          <div class="sub">${format(new Date(invoice.createdAt), "dd/MM/yyyy HH:mm")}</div>
        </div>
        <div class="section">
          <div class="row"><span>${isAr ? "العميل" : "Customer"}:</span><span>${invoice.customerName || (isAr ? "عميل عابر" : "Walk-in")}</span></div>
          ${invoice.customerPhone ? `<div class="row"><span>${isAr ? "الهاتف" : "Phone"}:</span><span>${invoice.customerPhone}</span></div>` : ""}
          <div class="row"><span>${isAr ? "الدفع" : "Payment"}:</span><span>${paymentLabel(invoice.paymentMethod)}</span></div>
        </div>
        <table class="items-table">
          <thead><tr>
            <th style="text-align:start">${isAr ? "المنتج" : "Product"}</th>
            <th>${isAr ? "الكمية" : "Qty"}</th>
            <th style="text-align:end">${isAr ? "السعر" : "Price"}</th>
          </tr></thead>
          <tbody>
            ${items.map((item: any) => `
              <tr>
                <td>${isAr ? item.productName : (item.productNameEn || item.productName)}
                  ${item.color ? `<br><small>${item.color}${item.size ? " · " + item.size : ""}</small>` : ""}
                </td>
                <td style="text-align:center">${item.qty}</td>
                <td style="text-align:end">${Number(item.lineTotal).toLocaleString()}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
        <div class="section">
          <div class="row"><span>${isAr ? "المجموع" : "Subtotal"}:</span><span>${Number(invoice.subtotal).toLocaleString()} ${currency}</span></div>
          ${Number(invoice.discountAmount) > 0 ? `<div class="row"><span>${isAr ? "الخصم" : "Discount"}:</span><span>- ${Number(invoice.discountAmount).toLocaleString()} ${currency}</span></div>` : ""}
          ${Number(invoice.taxAmount) > 0 ? `<div class="row"><span>${isAr ? "الضريبة" : "Tax"} (${invoice.taxRate}%):</span><span>${Number(invoice.taxAmount).toLocaleString()} ${currency}</span></div>` : ""}
          <div class="row total-row"><span>${isAr ? "الإجمالي" : "Total"}:</span><span>${Number(invoice.total).toLocaleString()} ${currency}</span></div>
        </div>
        <div class="footer">
          <p>${isAr ? "شكراً لزيارتكم" : "Thank you for your visit"}</p>
          <p>Darin Madani Fashion House</p>
        </div>
        <script>window.onload = function() { window.print(); window.close(); };</script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("invoices.title")}</h1>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder={isAr ? "بحث برقم الفاتورة أو اسم العميل..." : "Search by invoice # or customer..."} className="ps-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("common.all")}</SelectItem>
            <SelectItem value="completed">{isAr ? "مكتملة" : "Completed"}</SelectItem>
            <SelectItem value="pending">{isAr ? "معلقة" : "Pending"}</SelectItem>
            <SelectItem value="cancelled">{isAr ? "ملغاة" : "Cancelled"}</SelectItem>
            <SelectItem value="returned">{isAr ? "مرتجعة" : "Returned"}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Invoices table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("invoices.invoiceNumber")}</TableHead>
                <TableHead>{t("customers.name")}</TableHead>
                <TableHead>{t("common.date")}</TableHead>
                <TableHead>{t("pos.paymentMethod")}</TableHead>
                <TableHead>{t("common.total")}</TableHead>
                <TableHead>{t("common.status")}</TableHead>
                <TableHead>{t("common.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(invoices || []).map((inv: any) => (
                <TableRow key={inv.id}>
                  <TableCell className="font-mono text-sm font-medium">{inv.invoiceNumber}</TableCell>
                  <TableCell className="text-sm">{inv.customerName || (isAr ? "عميل عابر" : "Walk-in")}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(inv.createdAt), "dd/MM/yyyy HH:mm", { locale })}
                  </TableCell>
                  <TableCell className="text-sm">{paymentLabel(inv.paymentMethod)}</TableCell>
                  <TableCell className="font-bold text-primary">{Number(inv.total).toLocaleString()} {currency}</TableCell>
                  <TableCell>{statusBadge(inv.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setSelectedInvoice(inv); setShowDetail(true); }}>
                        <Eye size={13} />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handlePrint(inv)}>
                        <Printer size={13} />
                      </Button>
                      {inv.customerPhone && (
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-green-600" onClick={() => sendWhatsApp.mutate({ invoiceId: inv.id, phone: inv.customerPhone || "", origin: window.location.origin })}>
                          <MessageCircle size={13} />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {(!invoices || invoices.length === 0) && (
            <div className="py-12 text-center text-muted-foreground">
              <FileText size={32} className="mx-auto mb-2 opacity-30" />
              <p>{t("common.noData")}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invoice Detail Dialog */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText size={18} />
              {selectedInvoice?.invoiceNumber}
            </DialogTitle>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-4">
              {/* Invoice meta */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">{t("customers.name")}</p>
                  <p className="font-medium">{selectedInvoice.customerName || (isAr ? "عميل عابر" : "Walk-in")}</p>
                </div>
                {selectedInvoice.customerPhone && (
                  <div>
                    <p className="text-muted-foreground">{t("customers.phone")}</p>
                    <p className="font-medium">{selectedInvoice.customerPhone}</p>
                  </div>
                )}
                <div>
                  <p className="text-muted-foreground">{t("common.date")}</p>
                  <p className="font-medium">{format(new Date(selectedInvoice.createdAt), "dd/MM/yyyy HH:mm", { locale })}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">{t("pos.paymentMethod")}</p>
                  <p className="font-medium">{paymentLabel(selectedInvoice.paymentMethod)}</p>
                </div>
              </div>

              <Separator />

              {/* Items */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{isAr ? "المنتج" : "Product"}</TableHead>
                    <TableHead>{isAr ? "اللون/المقاس" : "Color/Size"}</TableHead>
                    <TableHead className="text-center">{t("common.qty")}</TableHead>
                    <TableHead className="text-end">{isAr ? "السعر" : "Price"}</TableHead>
                    <TableHead className="text-end">{t("common.total")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(selectedInvoice.items || []).map((item: any, i: number) => (
                    <TableRow key={i}>
                      <TableCell className="text-sm font-medium">{isAr ? item.productName : (item.productNameEn || item.productName)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{item.color}{item.size && ` · ${item.size}`}</TableCell>
                      <TableCell className="text-center text-sm">{item.qty}</TableCell>
                      <TableCell className="text-end text-sm">{Number(item.unitPrice).toLocaleString()}</TableCell>
                      <TableCell className="text-end text-sm font-medium">{Number(item.lineTotal).toLocaleString()} {currency}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <Separator />

              {/* Totals */}
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("common.subtotal")}</span>
                  <span>{Number(selectedInvoice.subtotal).toLocaleString()} {currency}</span>
                </div>
                {Number(selectedInvoice.discountAmount) > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>{t("common.discount")}</span>
                    <span>- {Number(selectedInvoice.discountAmount).toLocaleString()} {currency}</span>
                  </div>
                )}
                {Number(selectedInvoice.taxAmount) > 0 && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>{t("common.tax")} ({selectedInvoice.taxRate}%)</span>
                    <span>{Number(selectedInvoice.taxAmount).toLocaleString()} {currency}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-base border-t border-border pt-1.5">
                  <span>{t("common.total")}</span>
                  <span className="text-primary">{Number(selectedInvoice.total).toLocaleString()} {currency}</span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2 flex-wrap">
            {selectedInvoice?.status === "completed" && (
              <Button variant="outline" className="gap-2 text-destructive border-destructive/30"
                onClick={() => { if (confirm(isAr ? "هل تريد إلغاء هذه الفاتورة؟" : "Cancel this invoice?")) cancelInvoice.mutate({ id: selectedInvoice.id }); }}>
                <X size={14} />
                {isAr ? "إلغاء الفاتورة" : "Cancel Invoice"}
              </Button>
            )}
            {selectedInvoice?.customerPhone && (
              <Button variant="outline" className="gap-2 text-green-600 border-green-200"
                onClick={() => sendWhatsApp.mutate({ invoiceId: selectedInvoice.id, phone: selectedInvoice.customerPhone || "", origin: window.location.origin })}>
                <MessageCircle size={14} />
                {t("pos.sendWhatsApp")}
              </Button>
            )}
            <Button variant="outline" className="gap-2" onClick={() => handlePrint(selectedInvoice)}>
              <Printer size={14} />
              {t("common.print")}
            </Button>
            <Button onClick={() => setShowDetail(false)}>{t("common.close")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
