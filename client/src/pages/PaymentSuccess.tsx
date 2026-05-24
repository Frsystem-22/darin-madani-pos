import { useEffect, useState } from "react";

export default function PaymentSuccess() {
  const [invoiceId, setInvoiceId] = useState<string | null>(null);
  const [storeName, setStoreName] = useState("DM Fashion House");
  const [status, setStatus] = useState<"success" | "failed" | "pending">("success");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("invoiceId") || params.get("id");
    const st = params.get("status");
    setInvoiceId(id);
    if (st === "failed") setStatus("failed");
    else if (st === "pending") setStatus("pending");
    else setStatus("success");

    // جلب اسم المتجر من الإعدادات
    fetch("/api/trpc/settings.get?batch=1&input=%7B%220%22%3A%7B%22json%22%3Anull%7D%7D")
      .then((r) => r.json())
      .then((d) => {
        const s = d?.[0]?.result?.data?.json;
        if (s?.storeName) setStoreName(s.storeName);
      })
      .catch(() => {});
  }, []);

  return (
    <div
      dir="rtl"
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)",
        fontFamily: "'Segoe UI', Tahoma, Arial, sans-serif",
        padding: "24px 16px",
      }}
    >
      <div
        style={{
          background: "#1a1a1a",
          border: "1px solid #2a2a2a",
          borderRadius: "20px",
          padding: "40px 32px",
          maxWidth: "420px",
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
            alt="DM Fashion House"
            style={{ height: "56px", objectFit: "contain" }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
          <div style={{ color: "#C9A96E", fontSize: "1.1rem", fontWeight: 700, letterSpacing: "1px" }}>
            {storeName}
          </div>
          <div style={{
            width: "50px", height: "2px",
            background: "linear-gradient(90deg, transparent, #C9A96E, transparent)"
          }} />
        </div>

        {/* أيقونة الحالة */}
        {status === "success" ? (
          <>
            <div style={{
              width: "80px", height: "80px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #C9A96E22, #a0784022)",
              border: "2px solid #C9A96E44",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "2.5rem",
            }}>
              ✓
            </div>
            <div style={{ textAlign: "center" }}>
              <h1 style={{ color: "#C9A96E", fontSize: "1.5rem", fontWeight: 800, marginBottom: "8px" }}>
                تم السداد بنجاح!
              </h1>
              <p style={{ color: "#888", fontSize: "0.95rem" }}>
                شكراً لتسوّقك من {storeName}
              </p>
              {invoiceId && (
                <p style={{ color: "#666", fontSize: "0.85rem", marginTop: "8px" }}>
                  رقم الفاتورة:{" "}
                  <span style={{ color: "#C9A96E", fontWeight: 600 }}>#{invoiceId}</span>
                </p>
              )}
            </div>
          </>
        ) : status === "failed" ? (
          <>
            <div style={{
              width: "80px", height: "80px",
              borderRadius: "50%",
              background: "#e5737322",
              border: "2px solid #e5737344",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "2.5rem",
            }}>
              ✕
            </div>
            <div style={{ textAlign: "center" }}>
              <h1 style={{ color: "#e57373", fontSize: "1.5rem", fontWeight: 800, marginBottom: "8px" }}>
                فشلت عملية الدفع
              </h1>
              <p style={{ color: "#888", fontSize: "0.95rem" }}>
                يرجى المحاولة مرة أخرى أو اختيار طريقة دفع مختلفة
              </p>
            </div>
          </>
        ) : (
          <>
            <div style={{
              width: "80px", height: "80px",
              borderRadius: "50%",
              background: "#f9a82522",
              border: "2px solid #f9a82544",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "2.5rem",
            }}>
              ⏳
            </div>
            <div style={{ textAlign: "center" }}>
              <h1 style={{ color: "#f9a825", fontSize: "1.5rem", fontWeight: 800, marginBottom: "8px" }}>
                جاري معالجة الدفع
              </h1>
              <p style={{ color: "#888", fontSize: "0.95rem" }}>
                يرجى الانتظار بينما نتحقق من حالة الدفع
              </p>
            </div>
          </>
        )}

        {/* فاصل */}
        <div style={{ width: "100%", height: "1px", background: "#2a2a2a" }} />

        {/* رسالة ختامية */}
        <p style={{ color: "#555", fontSize: "0.85rem", textAlign: "center", lineHeight: "1.6" }}>
          {status === "success"
            ? "نتطلع لخدمتك مجدداً ✨\nيمكنك إغلاق هذه الصفحة"
            : "يمكنك إغلاق هذه الصفحة والتواصل مع الكاشير"}
        </p>
      </div>

      <p style={{ marginTop: "24px", color: "#333", fontSize: "0.75rem" }}>
        {storeName} &copy; {new Date().getFullYear()}
      </p>
    </div>
  );
}
