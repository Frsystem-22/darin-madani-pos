import { useState } from "react";
import { useTranslation } from "react-i18next";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Edit, Trash2, Users, MessageCircle, Phone, Star, ShoppingBag, Eye } from "lucide-react";
import { format } from "date-fns";
import { ar, enUS } from "date-fns/locale";

export default function Customers() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const locale = isAr ? ar : enUS;
  const currency = isAr ? "ر.س" : "SAR";

  const [search, setSearch] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editCustomer, setEditCustomer] = useState<any>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [showDetail, setShowDetail] = useState(false);

  const { data: customers, refetch } = trpc.customers.list.useQuery({ search: search || undefined });
  const { data: customerInvoices } = trpc.invoices.list.useQuery(
    { customerId: selectedCustomer?.id },
    { enabled: !!selectedCustomer }
  );

  const createCustomer = trpc.customers.create.useMutation({ onSuccess: () => { refetch(); setShowAddDialog(false); toast.success(isAr ? "تم إضافة العميل" : "Customer added"); } });
  const updateCustomer = trpc.customers.update.useMutation({ onSuccess: () => { refetch(); setEditCustomer(null); toast.success(isAr ? "تم تحديث العميل" : "Customer updated"); } });
  const deleteCustomer = trpc.customers.delete.useMutation({ onSuccess: () => { refetch(); toast.success(isAr ? "تم حذف العميل" : "Customer deleted"); } });

  const [form, setForm] = useState({ name: "", phone: "", email: "", city: "", notes: "", birthday: "", gender: "female" as "female" | "male" });

  const resetForm = () => setForm({ name: "", phone: "", email: "", city: "", notes: "", birthday: "", gender: "female" });

  const openEdit = (c: any) => {
    setForm({ name: c.name || "", phone: c.phone || "", email: c.email || "", city: c.city || "", notes: c.notes || "", birthday: c.birthday ? String(c.birthday).split("T")[0] : "", gender: c.gender || "female" });
    setEditCustomer(c);
  };

  const handleSubmit = async () => {
    if (!form.name) { toast.error(isAr ? "يرجى إدخال اسم العميل" : "Customer name required"); return; }
    const data = { ...form, birthday: form.birthday ? new Date(form.birthday) : undefined };
    if (editCustomer) {
      await updateCustomer.mutateAsync({ id: editCustomer.id, ...data });
    } else {
      await createCustomer.mutateAsync(data);
    }
  };

  const tierLabel = (tier: string) => {
    const map: Record<string, string> = { bronze: isAr ? "برونزي" : "Bronze", silver: isAr ? "فضي" : "Silver", gold: isAr ? "ذهبي" : "Gold", platinum: isAr ? "بلاتيني" : "Platinum" };
    return map[tier] || tier;
  };

  const tierColor = (tier: string) => {
    const map: Record<string, string> = { bronze: "text-amber-700", silver: "text-gray-500", gold: "text-yellow-500", platinum: "text-purple-500" };
    return map[tier] || "";
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("customers.title")}</h1>
        <Button className="gap-2" onClick={() => { resetForm(); setShowAddDialog(true); }}>
          <Plus size={16} />
          {t("customers.add")}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: isAr ? "إجمالي العملاء" : "Total Customers", value: customers?.length || 0, icon: <Users size={16} /> },
          { label: isAr ? "عملاء ذهبيون" : "Gold Customers", value: customers?.filter((c: any) => c.tier === "gold" || c.tier === "platinum").length || 0, icon: <Star size={16} /> },
        ].map((s, i) => (
          <Card key={i}>
            <CardContent className="p-3 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">{s.icon}</div>
              <div>
                <p className="text-lg font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder={isAr ? "بحث بالاسم أو الهاتف..." : "Search by name or phone..."} className="ps-9" />
      </div>

      {/* Customers table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("customers.name")}</TableHead>
                <TableHead>{t("customers.phone")}</TableHead>
                <TableHead>{isAr ? "المدينة" : "City"}</TableHead>
                <TableHead>{isAr ? "المشتريات" : "Purchases"}</TableHead>
                <TableHead>{isAr ? "الإجمالي" : "Total Spent"}</TableHead>
                <TableHead>{isAr ? "النقاط" : "Points"}</TableHead>
                <TableHead>{isAr ? "الفئة" : "Tier"}</TableHead>
                <TableHead>{t("common.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(customers || []).map((c: any) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">{c.name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-sm">{c.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{c.phone || "-"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{c.city || "-"}</TableCell>
                  <TableCell className="text-sm">{c.totalOrders || 0}</TableCell>
                  <TableCell className="text-sm font-medium text-primary">{Number(c.totalSpent || 0).toLocaleString()} {currency}</TableCell>
                  <TableCell className="text-sm">{c.points || 0}</TableCell>
                  <TableCell>
                    {c.tier && <span className={`text-xs font-medium ${tierColor(c.tier)}`}>{tierLabel(c.tier)}</span>}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setSelectedCustomer(c); setShowDetail(true); }}>
                        <Eye size={13} />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(c)}>
                        <Edit size={13} />
                      </Button>
                      {c.phone && (
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-green-600"
                          onClick={() => window.open(`https://wa.me/${c.phone.replace(/[^0-9]/g, "")}`, "_blank")}>
                          <MessageCircle size={13} />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive"
                        onClick={() => { if (confirm(isAr ? "هل تريد حذف هذا العميل؟" : "Delete this customer?")) deleteCustomer.mutate({ id: c.id }); }}>
                        <Trash2 size={13} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {(!customers || customers.length === 0) && (
            <div className="py-12 text-center text-muted-foreground">
              <Users size={32} className="mx-auto mb-2 opacity-30" />
              <p>{t("common.noData")}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={showAddDialog || !!editCustomer} onOpenChange={v => { if (!v) { setShowAddDialog(false); setEditCustomer(null); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editCustomer ? t("customers.edit") : t("customers.add")}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1">
              <Label>{t("customers.name")} *</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder={isAr ? "اسم العميل" : "Customer name"} />
            </div>
            <div className="space-y-1">
              <Label>{t("customers.phone")}</Label>
              <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="05xxxxxxxx" dir="ltr" />
            </div>
            <div className="space-y-1">
              <Label>{t("customers.email")}</Label>
              <Input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="email@example.com" dir="ltr" />
            </div>
            <div className="space-y-1">
              <Label>{isAr ? "المدينة" : "City"}</Label>
              <Input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>{isAr ? "تاريخ الميلاد" : "Birthday"}</Label>
              <Input type="date" value={form.birthday} onChange={e => setForm(f => ({ ...f, birthday: e.target.value }))} />
            </div>
            <div className="col-span-2 space-y-1">
              <Label>{t("common.notes")}</Label>
              <Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} placeholder={isAr ? "ملاحظات..." : "Notes..."} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowAddDialog(false); setEditCustomer(null); }}>{t("common.cancel")}</Button>
            <Button onClick={handleSubmit}>{t("common.save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Customer Detail Dialog */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-primary">{selectedCustomer?.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              {selectedCustomer?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedCustomer && (
            <Tabs defaultValue="info">
              <TabsList>
                <TabsTrigger value="info">{isAr ? "المعلومات" : "Info"}</TabsTrigger>
                <TabsTrigger value="purchases">{isAr ? "المشتريات" : "Purchases"}</TabsTrigger>
              </TabsList>
              <TabsContent value="info" className="space-y-4 mt-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {selectedCustomer.phone && <div><p className="text-muted-foreground">{t("customers.phone")}</p><p className="font-medium">{selectedCustomer.phone}</p></div>}
                  {selectedCustomer.email && <div><p className="text-muted-foreground">{t("customers.email")}</p><p className="font-medium">{selectedCustomer.email}</p></div>}
                  {selectedCustomer.city && <div><p className="text-muted-foreground">{isAr ? "المدينة" : "City"}</p><p className="font-medium">{selectedCustomer.city}</p></div>}
                  <div><p className="text-muted-foreground">{isAr ? "الفئة" : "Tier"}</p><p className={`font-medium ${tierColor(selectedCustomer.tier)}`}>{tierLabel(selectedCustomer.tier)}</p></div>
                  <div><p className="text-muted-foreground">{isAr ? "النقاط" : "Points"}</p><p className="font-bold text-primary">{selectedCustomer.points || 0}</p></div>
                  <div><p className="text-muted-foreground">{isAr ? "إجمالي المشتريات" : "Total Spent"}</p><p className="font-bold text-primary">{Number(selectedCustomer.totalSpent || 0).toLocaleString()} {currency}</p></div>
                </div>
                {selectedCustomer.notes && (
                  <div className="p-3 bg-muted rounded-lg text-sm">
                    <p className="text-muted-foreground mb-1">{t("common.notes")}</p>
                    <p>{selectedCustomer.notes}</p>
                  </div>
                )}
                {selectedCustomer.phone && (
                  <Button variant="outline" className="gap-2 text-green-600 border-green-200 w-full"
                    onClick={() => window.open(`https://wa.me/${selectedCustomer.phone.replace(/[^0-9]/g, "")}`, "_blank")}>
                    <MessageCircle size={14} />
                    {isAr ? "تواصل عبر الواتساب" : "Contact via WhatsApp"}
                  </Button>
                )}
              </TabsContent>
              <TabsContent value="purchases" className="mt-3">
                <div className="space-y-2">
                  {(customerInvoices || []).map((inv: any) => (
                    <div key={inv.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{inv.invoiceNumber}</p>
                        <p className="text-xs text-muted-foreground">{format(new Date(inv.createdAt), "dd/MM/yyyy", { locale })}</p>
                      </div>
                      <span className="font-bold text-primary">{Number(inv.total).toLocaleString()} {currency}</span>
                    </div>
                  ))}
                  {(!customerInvoices || customerInvoices.length === 0) && (
                    <p className="text-center text-muted-foreground py-6">{t("common.noData")}</p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          )}
          <DialogFooter>
            <Button onClick={() => setShowDetail(false)}>{t("common.close")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
