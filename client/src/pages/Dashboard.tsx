import { useTranslation } from "react-i18next";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  ShoppingCart, TrendingUp, Users, AlertTriangle, Package,
  ArrowUpRight, FileText, BarChart3
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { format } from "date-fns";
import { ar, enUS } from "date-fns/locale";

export default function Dashboard() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const locale = isAr ? ar : enUS;

  const { data: stats, isLoading: statsLoading } = trpc.users.dashboardStats.useQuery(undefined, { refetchInterval: 30000 });
  const { data: topProducts } = trpc.users.topProducts.useQuery({ limit: 5 });
  const { data: monthlySales } = trpc.users.monthlySales.useQuery({ months: 6 });
  const { data: lowStock } = trpc.users.lowStockProducts.useQuery();
  const { data: recentInvoices } = trpc.invoices.list.useQuery({ status: "completed" });

  const currency = isAr ? "ر.س" : "SAR";

  const statCards = [
    {
      title: t("dashboard.todaySales"),
      value: `${Number(stats?.todaySales || 0).toLocaleString("ar-SA")} ${currency}`,
      sub: `${stats?.todayOrders || 0} ${t("dashboard.todayOrders")}`,
      icon: <ShoppingCart size={20} />,
      color: "text-amber-600 bg-amber-50 dark:bg-amber-900/20",
    },
    {
      title: t("dashboard.monthSales"),
      value: `${Number(stats?.monthSales || 0).toLocaleString("ar-SA")} ${currency}`,
      sub: `${stats?.monthOrders || 0} ${t("dashboard.monthOrders")}`,
      icon: <TrendingUp size={20} />,
      color: "text-green-600 bg-green-50 dark:bg-green-900/20",
    },
    {
      title: t("dashboard.totalCustomers"),
      value: String(stats?.totalCustomers || 0),
      sub: t("customers.title"),
      icon: <Users size={20} />,
      color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20",
    },
    {
      title: t("dashboard.lowStock"),
      value: String(stats?.lowStockCount || 0),
      sub: t("dashboard.lowStockAlert"),
      icon: <AlertTriangle size={20} />,
      color: "text-red-600 bg-red-50 dark:bg-red-900/20",
      alert: (stats?.lowStockCount || 0) > 0,
    },
  ];

  const chartData = (monthlySales || []).map((m: any) => ({
    month: m.month,
    total: parseFloat(m.total),
    orders: parseInt(m.orders),
  }));

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("dashboard.title")}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {format(new Date(), "EEEE، d MMMM yyyy", { locale })}
          </p>
        </div>
        <Link href="/pos">
          <Button className="gap-2">
            <ShoppingCart size={16} />
            {t("pos.title")}
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <Card key={i} className={card.alert ? "border-red-200 dark:border-red-800" : ""}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className={`p-2 rounded-lg ${card.color}`}>
                  {card.icon}
                </div>
                {card.alert && <Badge variant="destructive" className="text-xs">!</Badge>}
              </div>
              <div className="mt-3">
                <p className="text-2xl font-bold text-foreground">{statsLoading ? "..." : card.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{card.title}</p>
                <p className="text-xs text-muted-foreground">{card.sub}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly sales chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 size={16} className="text-primary" />
              {t("dashboard.monthlySales")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                <Tooltip
                  contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "12px" }}
                  formatter={(val: any) => [`${Number(val).toLocaleString()} ${currency}`, t("common.total")]}
                />
                <Bar dataKey="total" fill="var(--primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top products */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp size={16} className="text-primary" />
              {t("dashboard.topProducts")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(topProducts || []).slice(0, 5).map((p: any, i: number) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{p.productName}</p>
                  <p className="text-xs text-muted-foreground">{p.totalQty} {t("common.qty")}</p>
                </div>
                <span className="text-xs font-medium text-primary">
                  {Number(p.totalRevenue).toLocaleString()} {currency}
                </span>
              </div>
            ))}
            {(!topProducts || topProducts.length === 0) && (
              <p className="text-sm text-muted-foreground text-center py-4">{t("common.noData")}</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent invoices */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText size={16} className="text-primary" />
                {t("dashboard.recentInvoices")}
              </CardTitle>
              <Link href="/invoices">
                <Button variant="ghost" size="sm" className="text-xs gap-1">
                  {t("common.all")} <ArrowUpRight size={12} />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {(recentInvoices || []).slice(0, 5).map((inv: any) => (
                <div key={inv.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm font-medium">{inv.invoiceNumber}</p>
                    <p className="text-xs text-muted-foreground">{inv.customerName || t("pos.walkIn")}</p>
                  </div>
                  <div className="text-end">
                    <p className="text-sm font-bold text-primary">{Number(inv.total).toLocaleString()} {currency}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(inv.createdAt), "d MMM", { locale })}
                    </p>
                  </div>
                </div>
              ))}
              {(!recentInvoices || recentInvoices.length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-4">{t("common.noData")}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Low stock */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2 text-amber-600">
                <AlertTriangle size={16} />
                {t("dashboard.lowStockAlert")}
              </CardTitle>
              <Link href="/inventory">
                <Button variant="ghost" size="sm" className="text-xs gap-1">
                  {t("common.all")} <ArrowUpRight size={12} />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {(lowStock || []).slice(0, 5).map((p: any) => (
                <div key={p.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="flex items-center gap-2">
                    <Package size={14} className="text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.color} {p.size}</p>
                    </div>
                  </div>
                  <Badge variant={p.totalQty === 0 ? "destructive" : "secondary"} className="text-xs">
                    {p.totalQty} {t("common.qty")}
                  </Badge>
                </div>
              ))}
              {(!lowStock || lowStock.length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-4">✅ {isAr ? "المخزون جيد" : "Stock is good"}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
