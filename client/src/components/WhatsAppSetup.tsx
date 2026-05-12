import { useState, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, RefreshCw, Unlink, Smartphone, CheckCircle2, XCircle, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function WhatsAppSetup() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const [phone, setPhone] = useState("");
  const [showSetup, setShowSetup] = useState(false);
  const [qrBase64, setQrBase64] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const utils = trpc.useUtils();

  const { data: status, isLoading: statusLoading } = trpc.whatsapp.getStatus.useQuery(undefined, {
    refetchInterval: 30000,
  });

  const createInstance = trpc.whatsapp.createInstance.useMutation({
    onSuccess: (data) => {
      if (data.qrBase64) {
        setQrBase64(data.qrBase64);
      }
      startPolling();
    },
    onError: (err) => {
      toast.error(err.message || "فشل إنشاء الاتصال");
      setIsCreating(false);
    },
  });

  const disconnect = trpc.whatsapp.disconnect.useMutation({
    onSuccess: () => {
      toast.success("تم قطع الاتصال");
      setQrBase64(null);
      setShowSetup(false);
      stopPolling();
      utils.whatsapp.getStatus.invalidate();
    },
  });

  const checkConnection = trpc.whatsapp.checkConnection.useQuery(undefined, {
    enabled: false,
  });

  const getQR = trpc.whatsapp.getQR.useQuery(undefined, { enabled: false });

  function startPolling() {
    stopPolling();
    pollingRef.current = setInterval(async () => {
      const result = await utils.whatsapp.checkConnection.fetch();
      if (result.state === "open") {
        stopPolling();
        toast.success("✅ تم ربط واتساب بنجاح!");
        setQrBase64(null);
        setShowSetup(false);
        utils.whatsapp.getStatus.invalidate();
      } else if (result.state === "connecting") {
        // تحديث QR
        const qrResult = await utils.whatsapp.getQR.fetch();
        if (qrResult.qrBase64) setQrBase64(qrResult.qrBase64);
      }
    }, 5000);

    // إيقاف الـ polling بعد 3 دقائق
    pollingTimeoutRef.current = setTimeout(() => {
      stopPolling();
    }, 180000);
  }

  function stopPolling() {
    if (pollingRef.current) clearInterval(pollingRef.current);
    if (pollingTimeoutRef.current) clearTimeout(pollingTimeoutRef.current);
  }

  useEffect(() => () => stopPolling(), []);

  async function handleCreate() {
    if (!phone.trim()) {
      toast.warning("أدخل رقم واتساب أولاً");
      return;
    }
    setIsCreating(true);
    setQrBase64(null);
    await createInstance.mutateAsync({ number: phone });
    setIsCreating(false);
  }

  async function handleRefreshQR() {
    setIsRefreshing(true);
    const result = await utils.whatsapp.getQR.fetch();
    if (result.qrBase64) setQrBase64(result.qrBase64);
    setIsRefreshing(false);
  }

  const statusInfo = () => {
    if (statusLoading) return { color: "bg-gray-100 text-gray-600", icon: <Loader2 className="w-5 h-5 animate-spin" />, label: "جاري التحميل..." };
    switch (status?.status) {
      case "connected":
        return { color: "bg-green-100 text-green-700", icon: <CheckCircle2 className="w-5 h-5 text-green-600" />, label: `متصل${status.number ? ` — ${status.number}` : ""}` };
      case "pending":
        return { color: "bg-yellow-100 text-yellow-700", icon: <Clock className="w-5 h-5 text-yellow-600" />, label: "في انتظار المسح" };
      case "disconnected":
        return { color: "bg-red-100 text-red-700", icon: <XCircle className="w-5 h-5 text-red-500" />, label: "الاتصال مقطوع" };
      default:
        return { color: "bg-gray-100 text-gray-600", icon: <Smartphone className="w-5 h-5 text-gray-400" />, label: "غير مُفعَّل" };
    }
  };

  const info = statusInfo();

  return (
    <div className="space-y-4" dir={isRTL ? "rtl" : "ltr"}>
      {/* حالة الاتصال */}
      <div className={`flex items-center gap-3 p-4 rounded-xl ${info.color}`}>
        {info.icon}
        <div className="flex-1">
          <p className="font-semibold text-sm">{info.label}</p>
          {status?.instanceName && (
            <p className="text-xs opacity-70 mt-0.5">{status.instanceName}</p>
          )}
        </div>
        {status?.status === "connected" && (
          <Button
            variant="ghost"
            size="sm"
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={() => disconnect.mutate()}
            disabled={disconnect.isPending}
          >
            <Unlink className="w-4 h-4 me-1" />
            قطع الاتصال
          </Button>
        )}
        {(status?.status === "disconnected" || status?.status === "not_configured") && !showSetup && (
          <Button
            size="sm"
            className="bg-[#25d366] hover:bg-[#1ebe5d] text-white"
            onClick={() => setShowSetup(true)}
          >
            إعداد واتساب
          </Button>
        )}
        {status?.status === "pending" && !showSetup && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowSetup(true)}
          >
            عرض QR Code
          </Button>
        )}
      </div>

      {/* نموذج الإعداد */}
      {showSetup && (
        <div className="border rounded-xl p-5 space-y-4 bg-white shadow-sm">
          <h3 className="font-bold text-base flex items-center gap-2">
            <span className="text-[#25d366] text-xl">📱</span>
            إعداد الاتصال بواتساب
          </h3>

          {!qrBase64 ? (
            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium mb-1 block">رقم واتساب</Label>
                <Input
                  placeholder="05xxxxxxxx أو 9665xxxxxxxx"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="text-left"
                  dir="ltr"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  className="bg-[#25d366] hover:bg-[#1ebe5d] text-white flex-1"
                  onClick={handleCreate}
                  disabled={isCreating}
                >
                  {isCreating ? (
                    <><Loader2 className="w-4 h-4 me-2 animate-spin" /> جاري الإنشاء...</>
                  ) : (
                    "📱 إنشاء الاتصال وجلب QR Code"
                  )}
                </Button>
                <Button variant="outline" onClick={() => setShowSetup(false)}>إلغاء</Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* QR Code */}
              <div className="flex flex-col items-center gap-3 p-5 bg-white rounded-xl border-2 border-dashed border-[#25d366]">
                <img
                  src={qrBase64.startsWith("data:") ? qrBase64 : `data:image/png;base64,${qrBase64}`}
                  alt="WhatsApp QR Code"
                  className="w-52 h-52 rounded-xl shadow-md"
                />
                <div className="text-center">
                  <p className="font-bold text-sm text-gray-800">امسح QR Code لربط واتساب</p>
                  <p className="text-xs text-gray-500 mt-1">
                    افتح واتساب ← الأجهزة المرتبطة ← ربط جهاز ← امسح الرمز
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleRefreshQR}
                    disabled={isRefreshing}
                  >
                    {isRefreshing ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                    <span className="ms-1">تحديث QR</span>
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => { setShowSetup(false); setQrBase64(null); stopPolling(); }}>
                    إغلاق
                  </Button>
                </div>
              </div>

              {/* مؤشر الانتظار */}
              <div className="flex items-center gap-2 text-sm text-yellow-700 bg-yellow-50 rounded-lg p-3">
                <Loader2 className="w-4 h-4 animate-spin text-yellow-600" />
                <span>في انتظار المسح... سيتم التحديث تلقائياً</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
