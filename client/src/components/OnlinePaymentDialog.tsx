import { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, Zap, MessageCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface OnlinePaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceId: number | null;
  qrUrl: string | null;
  paymentUrl: string | null;
  status: "waiting" | "paid" | "failed";
  onStatusChange: (status: "waiting" | "paid" | "failed") => void;
  onPaidConfirmed: () => void;
  completedInvoice: any;
  settings: any;
  isAr: boolean;
}

export default function OnlinePaymentDialog({
  open, onOpenChange, invoiceId, qrUrl, paymentUrl, status, onStatusChange,
  onPaidConfirmed, completedInvoice, settings, isAr,
}: OnlinePaymentDialogProps) {
  const utils = trpc.useUtils();
  const sendWhatsApp = trpc.invoices.sendWhatsApp.useMutation();

  // Poll payment status every 5 seconds
  const { data: paymentStatusData } = trpc.invoices.checkPaymentStatus.useQuery(
    { invoiceId: invoiceId! },
    {
      enabled: open && invoiceId !== null && status === "waiting",
      refetchInterval: 5000,
      refetchIntervalInBackground: false,
    }
  );

  useEffect(() => {
    if (paymentStatusData?.paid && status === "waiting") {
      onStatusChange("paid");
      toast.success(isAr ? "تم السداد بنجاح!" : "Payment successful!");
      utils.invoices.list.invalidate();
    }
  }, [paymentStatusData?.paid]);

  const handleSendPaymentLink = async () => {
    const phone = completedInvoice?.customer?.phone || completedInvoice?.customerPhone;
    if (!phone) {
      toast.error(isAr ? "لا يوجد رقم هاتف للعميل" : "No customer phone");
      return;
    }
    try {
      const storeName = settings?.storeName || "Darin Madani";
      const msg = `مرحباً *${completedInvoice?.customerName || completedInvoice?.customer?.name || ""}*\n\nتفضل اضغط على الرابط أدناه لإتمام سداد فاتورتك من *${storeName}*\n\nرابط الدفع:\n${paymentUrl}`;
      await sendWhatsApp.mutateAsync({
        invoiceId: invoiceId!,
        phone,
        message: msg,
        origin: window.location.origin,
      });
      toast.success(isAr ? "تم إرسال رابط الدفع عبر الواتساب" : "Payment link sent via WhatsApp");
    } catch {
      toast.error(isAr ? "فشل إرسال الواتساب" : "WhatsApp send failed");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => {
      if (!o && status === "paid") {
        onOpenChange(false);
        onPaidConfirmed();
      } else {
        onOpenChange(o);
      }
    }}>
      <DialogContent className="max-w-sm text-center">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-center gap-2">
            {status === "paid" ? (
              <><CheckCircle size={20} className="text-green-600" /> {isAr ? "تم السداد" : "Payment Complete"}</>
            ) : (
              <><Zap size={20} className="text-yellow-500" /> {isAr ? "انتظار السداد" : "Awaiting Payment"}</>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-2">
          {status === "paid" ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle size={40} className="text-green-600" />
              </div>
              <p className="text-lg font-bold text-green-600">{isAr ? "تم السداد بنجاح!" : "Payment Successful!"}</p>
              <p className="text-sm text-muted-foreground">{completedInvoice?.invoiceNumber}</p>
              <Button className="w-full" onClick={() => {
                onOpenChange(false);
                onPaidConfirmed();
              }}>
                {isAr ? "عرض الفاتورة" : "View Invoice"}
              </Button>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                {isAr ? "اطلب من العميل مسح الباركود أو اضغط على الرابط للدفع" : "Ask customer to scan QR or tap link to pay"}
              </p>

              {/* QR Code from MyFatoorah */}
              {qrUrl ? (
                <div className="border-4 border-primary/20 rounded-xl p-2 bg-white">
                  <img src={qrUrl} alt="QR Code" className="w-48 h-48 object-contain" />
                </div>
              ) : (
                <div className="w-48 h-48 border-2 border-dashed border-muted-foreground/30 rounded-xl flex items-center justify-center">
                  <div className="text-center">
                    <Zap size={32} className="mx-auto text-muted-foreground/50 mb-2" />
                    <p className="text-xs text-muted-foreground">{isAr ? "جاري تحميل الباركود..." : "Loading QR..."}</p>
                  </div>
                </div>
              )}

              {/* Payment link */}
              {paymentUrl && (
                <a
                  href={paymentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary underline break-all max-w-full"
                >
                  {isAr ? "فتح رابط الدفع" : "Open payment link"}
                </a>
              )}

              {/* Send via WhatsApp */}
              {(completedInvoice?.customer?.phone || completedInvoice?.customerPhone) && (
                <Button
                  variant="outline"
                  className="w-full gap-2 text-green-600 border-green-200 hover:bg-green-50"
                  onClick={handleSendPaymentLink}
                  disabled={sendWhatsApp.isPending}
                >
                  <MessageCircle size={16} />
                  {isAr ? "إرسال رابط الدفع عبر الواتساب" : "Send Payment Link via WhatsApp"}
                </Button>
              )}

              {/* Polling indicator */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                {isAr ? "يتم التحقق من حالة السداد كل 5 ثوانٍ..." : "Checking payment status every 5 seconds..."}
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="text-muted-foreground"
              >
                {isAr ? "إغلاق (يمكن متابعة حالة السداد من صفحة الفواتير)" : "Close (check status in Invoices page)"}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
