import { useEffect, useState } from "react";

interface PaymentInfo {
  status: string;
  total: string;
  customerName: string;
  mfPaymentUrl: string;
  storeName: string;
}

export default function PaymentPage() {
  const [info, setInfo] = useState<PaymentInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // استخراج token من query string
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");

  useEffect(() => {
    if (!token) {
      setError("رابط الدفع غير صحيح");
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        const res = await fetch(`/api/payment-info?token=${encodeURIComponent(token)}`);
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "خطأ في تحميل معلومات الدفع");
        } else {
          setInfo(data);
        }
      } catch (e) {
        setError("خطأ في الاتصال بالخادم");
      } finally {
        setLoading(false);
      }
    };

    load();

    // polling كل 5 ثوانٍ لتحديث الحالة
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/payment-info?token=${encodeURIComponent(token)}`);
        const data = await res.json();
        if (res.ok) setInfo(data);
      } catch {}
    }, 5000);

    return () => clearInterval(interval);
  }, [token]);

  const storeName = info?.storeName || "DM Fashion House";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Segoe UI', Tahoma, Arial, sans-serif",
        padding: "24px 16px",
        color: "#fff",
        direction: "rtl",
      }}
    >
      <div
        style={{
          background: "#1a1a1a",
          border: "1px solid #2a2a2a",
          borderRadius: "20px",
          padding: "40px 32px",
          maxWidth: "440px",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "20px",
          boxShadow: "0 16px 48px rgba(0,0,0,0.5)",
        }}
      >
        {/* الشعار */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
          <img
            src="/logo-dark.webp"
            alt={storeName}
            style={{ height: "56px", objectFit: "contain" }}
            onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
          />
          <div style={{ color: "#C9A96E", fontSize: "1.1rem", fontWeight: 700, letterSpacing: "1px" }}>
            {storeName}
          </div>
          <div
            style={{
              width: "50px",
              height: "2px",
              background: "linear-gradient(90deg, transparent, #C9A96E, transparent)",
            }}
          />
        </div>

        {/* المحتوى */}
        {loading && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "32px",
                height: "32px",
                border: "3px solid #2a2a2a",
                borderTopColor: "#C9A96E",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
              }}
            />
            <p style={{ color: "#888", fontSize: "0.9rem" }}>جاري تحميل معلومات الدفع...</p>
          </div>
        )}

        {error && (
          <p style={{ color: "#e57373", fontSize: "0.9rem", textAlign: "center" }}>{error}</p>
        )}

        {!loading && !error && info && (
          <>
            {info.status === "paid" ? (
              <div
                style={{
                  background: "#1a3a1a",
                  border: "1px solid #2a5a2a",
                  borderRadius: "12px",
                  padding: "24px",
                  textAlign: "center",
                  width: "100%",
                }}
              >
                <div style={{ fontSize: "2.5rem", marginBottom: "8px" }}>✓</div>
                <h2 style={{ color: "#4caf50", fontSize: "1.3rem" }}>تم السداد بنجاح!</h2>
                <p style={{ color: "#888", fontSize: "0.9rem", marginTop: "6px" }}>
                  شكراً لتسوّقك من {storeName}
                </p>
              </div>
            ) : (
              <>
                <div style={{ fontSize: "2rem", fontWeight: 800, color: "#C9A96E" }}>
                  {parseFloat(info.total || "0").toFixed(2)}{" "}
                  <span style={{ fontSize: "1rem", color: "#888" }}>ر.س</span>
                </div>
                {info.customerName && (
                  <p style={{ color: "#aaa", fontSize: "0.95rem" }}>مرحباً، {info.customerName}</p>
                )}
                {info.mfPaymentUrl ? (
                  <>
                    {/* زر الدفع يفتح رابط MyFatoorah الأصلي مباشرة */}
                    <a
                      href={info.mfPaymentUrl}
                      style={{
                        width: "100%",
                        background: "linear-gradient(135deg, #C9A96E, #a07840)",
                        color: "#fff",
                        border: "none",
                        borderRadius: "12px",
                        padding: "16px 24px",
                        fontSize: "1.1rem",
                        fontWeight: 700,
                        cursor: "pointer",
                        textDecoration: "none",
                        textAlign: "center",
                        display: "block",
                        boxSizing: "border-box",
                      }}
                    >
                      💳 ادفع الآن
                    </a>
                    <p style={{ color: "#555", fontSize: "0.8rem", textAlign: "center" }}>
                      ستُحوَّل لصفحة الدفع الآمنة
                    </p>
                  </>
                ) : (
                  <p style={{ color: "#e57373", fontSize: "0.9rem" }}>رابط الدفع غير متاح حالياً</p>
                )}
              </>
            )}
          </>
        )}
      </div>

      <p style={{ marginTop: "24px", color: "#333", fontSize: "0.75rem" }}>
        DM Fashion House © {new Date().getFullYear()}
      </p>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
