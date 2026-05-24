import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { BarChart3, ShoppingCart, Package, TrendingUp, Users } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// ===== تقرير المبيعات =====
function SalesReport() {
  const today = new Date().toISOString().split("T")[0];
  const [from, setFrom] = useState(today);
  const [to, setTo] = useState(today);
  const [range, setRange] = useState({ from: today, to: today });

  const { data, isLoading } = trpc.reports.sales.useQuery(range);

  const apply = () => setRange({ from, to });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-end">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">من</label>
          <input
            type="date"
            value={from}
            onChange={e => setFrom(e.target.value)}
            className="border rounded px-2 py-1 text-sm bg-background"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">إلى</label>
          <input
            type="date"
            value={to}
            onChange={e => setTo(e.target.value)}
            className="border rounded px-2 py-1 text-sm bg-background"
          />
        </div>
        <button
          onClick={apply}
          className="px-4 py-1.5 rounded text-sm font-medium text-white"
          style={{ background: "#C9A96E" }}
        >
          تطبيق
        </button>
        <button
          onClick={() => window.print()}
          className="px-4 py-1.5 rounded text-sm font-medium border"
        >
          طباعة
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">جاري التحميل...</div>
      ) : data ? (
        <div className="space-y-4">
          {/* بطاقات الملخص */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card>
              <CardHeader className="pb-1 pt-3 px-3">
                <CardTitle className="text-xs text-muted-foreground">إجمالي المبيعات</CardTitle>
              </CardHeader>
              <CardContent className="px-3 pb-3">
                <p className="text-lg font-bold" style={{ color: "#C9A96E" }}>
                  {Number(data.summary?.totalRevenue ?? 0).toFixed(2)} ر.س
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-1 pt-3 px-3">
                <CardTitle className="text-xs text-muted-foreground">عدد الفواتير</CardTitle>
              </CardHeader>
              <CardContent className="px-3 pb-3">
                <p className="text-lg font-bold">{data.summary?.totalInvoices ?? 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-1 pt-3 px-3">
                <CardTitle className="text-xs text-muted-foreground">قطع مباعة</CardTitle>
              </CardHeader>
              <CardContent className="px-3 pb-3">
                <p className="text-lg font-bold">{data.summary?.totalItems ?? 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-1 pt-3 px-3">
                <CardTitle className="text-xs text-muted-foreground">متوسط الفاتورة</CardTitle>
              </CardHeader>
              <CardContent className="px-3 pb-3">
                <p className="text-lg font-bold">
                  {Number(data.summary?.avgInvoice ?? 0).toFixed(2)} ر.س
                </p>
              </CardContent>
            </Card>
          </div>

          {/* جدول المبيعات */}
          {data.invoices && data.invoices.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-right py-2 px-2 font-medium text-muted-foreground">رقم الفاتورة</th>
                    <th className="text-right py-2 px-2 font-medium text-muted-foreground">التاريخ</th>
                    <th className="text-right py-2 px-2 font-medium text-muted-foreground">العميل</th>
                    <th className="text-right py-2 px-2 font-medium text-muted-foreground">الإجمالي</th>
                    <th className="text-right py-2 px-2 font-medium text-muted-foreground">الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  {data.invoices.map((inv: any) => (
                    <tr key={inv.id} className="border-b hover:bg-muted/30">
                      <td className="py-2 px-2">{inv.invoiceNumber}</td>
                      <td className="py-2 px-2">{new Date(inv.createdAt).toLocaleDateString("ar-SA")}</td>
                      <td className="py-2 px-2">{inv.customerName ?? "—"}</td>
                      <td className="py-2 px-2">{Number(inv.total).toFixed(2)} ر.س</td>
                      <td className="py-2 px-2">{inv.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">لا توجد بيانات</div>
      )}
    </div>
  );
}

// ===== تقرير المخزون =====
function InventoryReport() {
  const { data, isLoading } = trpc.reports.inventory.useQuery();
  const print = () => window.print();

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={print} className="px-4 py-1.5 rounded text-sm font-medium border">
          طباعة
        </button>
      </div>
      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">جاري التحميل...</div>
      ) : data ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <Card>
              <CardHeader className="pb-1 pt-3 px-3">
                <CardTitle className="text-xs text-muted-foreground">إجمالي المنتجات</CardTitle>
              </CardHeader>
              <CardContent className="px-3 pb-3">
                <p className="text-lg font-bold">{data.summary?.totalProducts ?? 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-1 pt-3 px-3">
                <CardTitle className="text-xs text-muted-foreground">إجمالي الكميات</CardTitle>
              </CardHeader>
              <CardContent className="px-3 pb-3">
                <p className="text-lg font-bold">{data.summary?.totalQuantity ?? 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-1 pt-3 px-3">
                <CardTitle className="text-xs text-muted-foreground">قيمة المخزون</CardTitle>
              </CardHeader>
              <CardContent className="px-3 pb-3">
                <p className="text-lg font-bold" style={{ color: "#C9A96E" }}>
                  {Number(data.summary?.totalValue ?? 0).toFixed(2)} ر.س
                </p>
              </CardContent>
            </Card>
          </div>

          {data.products && data.products.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-right py-2 px-2 font-medium text-muted-foreground">المنتج</th>
                    <th className="text-right py-2 px-2 font-medium text-muted-foreground">SKU</th>
                    <th className="text-right py-2 px-2 font-medium text-muted-foreground">الكمية</th>
                    <th className="text-right py-2 px-2 font-medium text-muted-foreground">السعر</th>
                    <th className="text-right py-2 px-2 font-medium text-muted-foreground">القيمة</th>
                  </tr>
                </thead>
                <tbody>
                  {data.products.map((p: any) => (
                    <tr key={p.id} className="border-b hover:bg-muted/30">
                      <td className="py-2 px-2">{p.name}</td>
                      <td className="py-2 px-2 font-mono text-xs">{p.sku}</td>
                      <td className="py-2 px-2">{p.quantity ?? 0}</td>
                      <td className="py-2 px-2">{Number(p.price ?? 0).toFixed(2)} ر.س</td>
                      <td className="py-2 px-2">{Number((p.quantity ?? 0) * (p.price ?? 0)).toFixed(2)} ر.س</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">لا توجد بيانات</div>
      )}
    </div>
  );
}

// ===== تقرير المشتريات =====
function PurchasesReport() {
  const today = new Date().toISOString().split("T")[0];
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [range, setRange] = useState<{ from?: string; to?: string }>({});

  const { data, isLoading } = trpc.reports.purchases.useQuery(
    Object.keys(range).length ? range : undefined
  );

  const apply = () => setRange({ from: from || undefined, to: to || undefined });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-end">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">من</label>
          <input
            type="date"
            value={from}
            onChange={e => setFrom(e.target.value)}
            className="border rounded px-2 py-1 text-sm bg-background"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">إلى</label>
          <input
            type="date"
            value={to}
            onChange={e => setTo(e.target.value)}
            className="border rounded px-2 py-1 text-sm bg-background"
          />
        </div>
        <button
          onClick={apply}
          className="px-4 py-1.5 rounded text-sm font-medium text-white"
          style={{ background: "#C9A96E" }}
        >
          تطبيق
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">جاري التحميل...</div>
      ) : data && (data as any[]).length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-right py-2 px-2 font-medium text-muted-foreground">المنتج</th>
                <th className="text-right py-2 px-2 font-medium text-muted-foreground">الكمية</th>
                <th className="text-right py-2 px-2 font-medium text-muted-foreground">التاريخ</th>
                <th className="text-right py-2 px-2 font-medium text-muted-foreground">المستودع</th>
              </tr>
            </thead>
            <tbody>
              {(data as any[]).map((p: any, i: number) => (
                <tr key={i} className="border-b hover:bg-muted/30">
                  <td className="py-2 px-2">{p.productName ?? p.product?.name ?? "—"}</td>
                  <td className="py-2 px-2">{p.quantity}</td>
                  <td className="py-2 px-2">{p.createdAt ? new Date(p.createdAt).toLocaleDateString("ar-SA") : "—"}</td>
                  <td className="py-2 px-2">{p.warehouseName ?? p.warehouse?.name ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">لا توجد بيانات</div>
      )}
    </div>
  );
}

// ===== تقرير الموظفين =====
function StaffReport() {
  const today = new Date().toISOString().split("T")[0];
  const [from, setFrom] = useState(today);
  const [to, setTo] = useState(today);
  const [range, setRange] = useState({ from: today, to: today });

  const { data, isLoading } = trpc.reports.staff.useQuery(range);

  const apply = () => setRange({ from, to });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-end">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">من</label>
          <input
            type="date"
            value={from}
            onChange={e => setFrom(e.target.value)}
            className="border rounded px-2 py-1 text-sm bg-background"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">إلى</label>
          <input
            type="date"
            value={to}
            onChange={e => setTo(e.target.value)}
            className="border rounded px-2 py-1 text-sm bg-background"
          />
        </div>
        <button
          onClick={apply}
          className="px-4 py-1.5 rounded text-sm font-medium text-white"
          style={{ background: "#C9A96E" }}
        >
          تطبيق
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">جاري التحميل...</div>
      ) : data && (data as any[]).length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-right py-2 px-2 font-medium text-muted-foreground">الموظف</th>
                <th className="text-right py-2 px-2 font-medium text-muted-foreground">عدد الفواتير</th>
                <th className="text-right py-2 px-2 font-medium text-muted-foreground">إجمالي المبيعات</th>
              </tr>
            </thead>
            <tbody>
              {(data as any[]).map((s: any, i: number) => (
                <tr key={i} className="border-b hover:bg-muted/30">
                  <td className="py-2 px-2">{s.userName ?? s.user?.name ?? "—"}</td>
                  <td className="py-2 px-2">{s.invoiceCount ?? 0}</td>
                  <td className="py-2 px-2">{Number(s.totalRevenue ?? 0).toFixed(2)} ر.س</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">لا توجد بيانات</div>
      )}
    </div>
  );
}

// ===== الصفحة الرئيسية =====
export default function Reports() {
  return (
    <div className="p-4 md:p-6 space-y-4" dir="rtl">
      <div className="flex items-center gap-3 mb-2">
        <BarChart3 className="w-6 h-6" style={{ color: "#C9A96E" }} />
        <h1 className="text-xl font-bold">التقارير</h1>
      </div>

      <Tabs defaultValue="sales">
        <TabsList className="grid grid-cols-4 w-full max-w-lg">
          <TabsTrigger value="sales" className="text-xs">
            <ShoppingCart className="w-3 h-3 me-1" /> المبيعات
          </TabsTrigger>
          <TabsTrigger value="inventory" className="text-xs">
            <Package className="w-3 h-3 me-1" /> المخزون
          </TabsTrigger>
          <TabsTrigger value="purchases" className="text-xs">
            <TrendingUp className="w-3 h-3 me-1" /> المشتريات
          </TabsTrigger>
          <TabsTrigger value="staff" className="text-xs">
            <Users className="w-3 h-3 me-1" /> الموظفون
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="mt-4">
          <SalesReport />
        </TabsContent>
        <TabsContent value="inventory" className="mt-4">
          <InventoryReport />
        </TabsContent>
        <TabsContent value="purchases" className="mt-4">
          <PurchasesReport />
        </TabsContent>
        <TabsContent value="staff" className="mt-4">
          <StaffReport />
        </TabsContent>
      </Tabs>
    </div>
  );
}
