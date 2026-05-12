import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Edit, Save, Store, MessageCircle, CreditCard, Package, Tag } from "lucide-react";

export default function Settings() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";

  const { data: settings, refetch: refetchSettings } = trpc.settings.get.useQuery();
  const { data: warehouses, refetch: refetchWarehouses } = trpc.settings.getWarehouses.useQuery();
  const { data: categories, refetch: refetchCategories } = trpc.settings.getCategories.useQuery();
  const { data: discounts, refetch: refetchDiscounts } = trpc.settings.getDiscounts.useQuery();

  const updateSettings = trpc.settings.update.useMutation({ onSuccess: () => { refetchSettings(); toast.success(isAr ? "تم حفظ الإعدادات" : "Settings saved"); } });
  const createWarehouse = trpc.settings.createWarehouse.useMutation({ onSuccess: () => { refetchWarehouses(); setShowWarehouseDialog(false); } });
  const updateWarehouse = trpc.settings.updateWarehouse.useMutation({ onSuccess: () => { refetchWarehouses(); setShowWarehouseDialog(false); } });
  const deleteWarehouse = trpc.settings.deleteWarehouse.useMutation({ onSuccess: () => refetchWarehouses() });
  const createCategory = trpc.settings.createCategory.useMutation({ onSuccess: () => { refetchCategories(); setShowCategoryDialog(false); } });
  const deleteCategory = trpc.settings.deleteCategory.useMutation({ onSuccess: () => refetchCategories() });
  const createDiscount = trpc.settings.createDiscount.useMutation({ onSuccess: () => { refetchDiscounts(); setShowDiscountDialog(false); } });
  const updateDiscount = trpc.settings.updateDiscount.useMutation({ onSuccess: () => { refetchDiscounts(); setShowDiscountDialog(false); } });
  const deleteDiscount = trpc.settings.deleteDiscount.useMutation({ onSuccess: () => refetchDiscounts() });

  const [form, setForm] = useState<any>({});
  const [showWarehouseDialog, setShowWarehouseDialog] = useState(false);
  const [editWarehouse, setEditWarehouse] = useState<any>(null);
  const [warehouseForm, setWarehouseForm] = useState({ name: "", nameEn: "", description: "" });
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [categoryForm, setCategoryForm] = useState({ name: "", nameEn: "", color: "#8B7355" });
  const [showDiscountDialog, setShowDiscountDialog] = useState(false);
  const [editDiscount, setEditDiscount] = useState<any>(null);
  const [discountForm, setDiscountForm] = useState({ name: "", nameEn: "", type: "percentage" as "percentage" | "fixed", value: "", minPurchase: "", maxUses: "", isActive: true, startDate: "", endDate: "" });

  useEffect(() => {
    if (settings) setForm(settings);
  }, [settings]);

  const handleSave = async () => {
    await updateSettings.mutateAsync(form);
  };

  const handleWarehouseSubmit = async () => {
    if (editWarehouse) {
      await updateWarehouse.mutateAsync({ id: editWarehouse.id, ...warehouseForm });
    } else {
      await createWarehouse.mutateAsync(warehouseForm);
    }
  };

  const handleDiscountSubmit = async () => {
    const data = { ...discountForm, value: discountForm.value, minPurchase: discountForm.minPurchase || undefined, maxUses: discountForm.maxUses ? parseInt(discountForm.maxUses) : undefined, startDate: discountForm.startDate ? new Date(discountForm.startDate) : undefined, endDate: discountForm.endDate ? new Date(discountForm.endDate) : undefined };
    if (editDiscount) {
      await updateDiscount.mutateAsync({ id: editDiscount.id, ...data });
    } else {
      await createDiscount.mutateAsync(data);
    }
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">{t("settings.title")}</h1>

      <Tabs defaultValue="store">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="store" className="gap-1"><Store className="h-3 w-3" />{isAr ? "المتجر" : "Store"}</TabsTrigger>
          <TabsTrigger value="whatsapp" className="gap-1"><MessageCircle className="h-3 w-3" />{isAr ? "واتساب" : "WhatsApp"}</TabsTrigger>
          <TabsTrigger value="payment" className="gap-1"><CreditCard className="h-3 w-3" />{isAr ? "الدفع" : "Payment"}</TabsTrigger>
          <TabsTrigger value="warehouses" className="gap-1"><Package className="h-3 w-3" />{isAr ? "المستودعات" : "Warehouses"}</TabsTrigger>
          <TabsTrigger value="categories" className="gap-1"><Tag className="h-3 w-3" />{isAr ? "التصنيفات" : "Categories"}</TabsTrigger>
          <TabsTrigger value="discounts" className="gap-1"><Tag className="h-3 w-3" />{isAr ? "الخصومات" : "Discounts"}</TabsTrigger>
        </TabsList>

        {/* Store Settings */}
        <TabsContent value="store" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">{isAr ? "بيانات المتجر" : "Store Information"}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>{isAr ? "اسم المتجر (عربي)" : "Store Name (Arabic)"}</Label>
                  <Input value={form.storeName || ""} onChange={e => setForm((f: any) => ({ ...f, storeName: e.target.value }))} />
                </div>
                <div className="space-y-1">
                  <Label>{isAr ? "اسم المتجر (إنجليزي)" : "Store Name (English)"}</Label>
                  <Input value={form.storeNameEn || ""} onChange={e => setForm((f: any) => ({ ...f, storeNameEn: e.target.value }))} dir="ltr" />
                </div>
                <div className="space-y-1">
                  <Label>{isAr ? "رقم الهاتف" : "Phone"}</Label>
                  <Input value={form.storePhone || ""} onChange={e => setForm((f: any) => ({ ...f, storePhone: e.target.value }))} dir="ltr" />
                </div>
                <div className="space-y-1">
                  <Label>{isAr ? "البريد الإلكتروني" : "Email"}</Label>
                  <Input value={form.storeEmail || ""} onChange={e => setForm((f: any) => ({ ...f, storeEmail: e.target.value }))} dir="ltr" />
                </div>
                <div className="space-y-1">
                  <Label>{isAr ? "الرقم الضريبي" : "Tax Number"}</Label>
                  <Input value={form.taxNumber || ""} onChange={e => setForm((f: any) => ({ ...f, taxNumber: e.target.value }))} dir="ltr" />
                </div>
                <div className="space-y-1">
                  <Label>{isAr ? "نسبة الضريبة (%)" : "Tax Rate (%)"}</Label>
                  <Input type="number" value={form.taxRate || "15"} onChange={e => setForm((f: any) => ({ ...f, taxRate: e.target.value }))} dir="ltr" />
                </div>
                <div className="space-y-1">
                  <Label>{isAr ? "رمز العملة" : "Currency Symbol"}</Label>
                  <Input value={form.currencySymbol || "ر.س"} onChange={e => setForm((f: any) => ({ ...f, currencySymbol: e.target.value }))} />
                </div>
                <div className="space-y-1">
                  <Label>{isAr ? "حد تنبيه المخزون" : "Low Stock Alert"}</Label>
                  <Input type="number" value={form.lowStockThreshold || "5"} onChange={e => setForm((f: any) => ({ ...f, lowStockThreshold: parseInt(e.target.value) }))} dir="ltr" />
                </div>
                <div className="col-span-2 space-y-1">
                  <Label>{isAr ? "العنوان" : "Address"}</Label>
                  <Textarea value={form.storeAddress || ""} onChange={e => setForm((f: any) => ({ ...f, storeAddress: e.target.value }))} rows={2} />
                </div>
                <div className="col-span-2 space-y-1">
                  <Label>{isAr ? "نص تذييل الفاتورة" : "Invoice Footer"}</Label>
                  <Textarea value={form.invoiceNote || ""} onChange={e => setForm((f: any) => ({ ...f, invoiceNote: e.target.value }))} rows={2} />
                </div>
              </div>
              <Button onClick={handleSave} className="gap-2"><Save className="h-4 w-4" />{t("common.save")}</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* WhatsApp Settings */}
        <TabsContent value="whatsapp" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">{isAr ? "إعدادات الواتساب (Evolution API)" : "WhatsApp Settings (Evolution API)"}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Switch checked={form.whatsappEnabled || false} onCheckedChange={v => setForm((f: any) => ({ ...f, whatsappEnabled: v }))} />
                <Label>{isAr ? "تفعيل الواتساب" : "Enable WhatsApp"}</Label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>{isAr ? "رابط API" : "API Base URL"}</Label>
                  <Input value={form.whatsappApiBase || ""} onChange={e => setForm((f: any) => ({ ...f, whatsappApiBase: e.target.value }))} placeholder="https://elv.academy-smart.com" dir="ltr" />
                </div>
                <div className="space-y-1">
                  <Label>{isAr ? "اسم الـ Instance" : "Instance Name"}</Label>
                  <Input value={form.whatsappInstance || ""} onChange={e => setForm((f: any) => ({ ...f, whatsappInstance: e.target.value }))} dir="ltr" />
                </div>
                <div className="col-span-2 space-y-1">
                  <Label>{isAr ? "مفتاح API" : "API Key"}</Label>
                  <Input value={form.whatsappApiKey || ""} onChange={e => setForm((f: any) => ({ ...f, whatsappApiKey: e.target.value }))} type="password" dir="ltr" />
                </div>
                <div className="col-span-2 space-y-1">
                  <Label>{isAr ? "قالب رسالة الفاتورة" : "Invoice Message Template"}</Label>
                  <Textarea value={form.whatsappTemplate || ""} onChange={e => setForm((f: any) => ({ ...f, whatsappTemplate: e.target.value }))} rows={4} dir="ltr" placeholder={"🛍️ شكراً لتسوقك في *{storeName}*\n\nفاتورة رقم: *{invoiceNumber}*\nالإجمالي: *{total} {currency}*\n\n📄 رابط الفاتورة:\n{invoiceUrl}"} />
                  <p className="text-xs text-muted-foreground">{isAr ? "المتغيرات: {storeName} {invoiceNumber} {total} {currency} {invoiceUrl}" : "Variables: {storeName} {invoiceNumber} {total} {currency} {invoiceUrl}"}</p>
                </div>
              </div>
              <Button onClick={handleSave} className="gap-2"><Save className="h-4 w-4" />{t("common.save")}</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Settings */}
        <TabsContent value="payment" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">{isAr ? "إعدادات MyFatoorah" : "MyFatoorah Settings"}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Switch checked={form.myfatoorahEnabled || false} onCheckedChange={v => setForm((f: any) => ({ ...f, myfatoorahEnabled: v }))} />
                <Label>{isAr ? "تفعيل MyFatoorah" : "Enable MyFatoorah"}</Label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>{isAr ? "البيئة" : "Environment"}</Label>
                  <Select value={form.myfatoorahEnv || "test"} onValueChange={v => setForm((f: any) => ({ ...f, myfatoorahEnv: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="test">{isAr ? "تجريبي" : "Test"}</SelectItem>
                      <SelectItem value="live">{isAr ? "حقيقي" : "Live"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>{isAr ? "كود المورد" : "Supplier Code"}</Label>
                  <Input value={form.myfatoorahSupplier || ""} onChange={e => setForm((f: any) => ({ ...f, myfatoorahSupplier: e.target.value }))} dir="ltr" />
                </div>
                <div className="col-span-2 space-y-1">
                  <Label>{isAr ? "Token" : "API Token"}</Label>
                  <Input value={form.myfatoorahToken || ""} onChange={e => setForm((f: any) => ({ ...f, myfatoorahToken: e.target.value }))} type="password" dir="ltr" />
                </div>
              </div>
              <Button onClick={handleSave} className="gap-2"><Save className="h-4 w-4" />{t("common.save")}</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Warehouses */}
        <TabsContent value="warehouses" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">{isAr ? "المستودعات" : "Warehouses"}</CardTitle>
              <Button size="sm" className="gap-1" onClick={() => { setEditWarehouse(null); setWarehouseForm({ name: "", nameEn: "", description: "" }); setShowWarehouseDialog(true); }}>
                <Plus className="h-3 w-3" />{isAr ? "إضافة" : "Add"}
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{isAr ? "الاسم" : "Name"}</TableHead>
                    <TableHead>{isAr ? "الاسم (إنجليزي)" : "Name (EN)"}</TableHead>
                    <TableHead>{isAr ? "العنوان" : "Address"}</TableHead>
                    <TableHead>{t("common.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(warehouses || []).map((w: any) => (
                    <TableRow key={w.id}>
                      <TableCell className="font-medium">{w.name}</TableCell>
                      <TableCell className="text-muted-foreground">{w.nameEn || "-"}</TableCell>
                      <TableCell className="text-muted-foreground">{w.description || "-"}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditWarehouse(w); setWarehouseForm({ name: w.name, nameEn: w.nameEn || "", description: w.description || "" }); setShowWarehouseDialog(true); }}>
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteWarehouse.mutate({ id: w.id })}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Categories */}
        <TabsContent value="categories" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">{isAr ? "تصنيفات المنتجات" : "Product Categories"}</CardTitle>
              <Button size="sm" className="gap-1" onClick={() => { setCategoryForm({ name: "", nameEn: "", color: "#8B7355" }); setShowCategoryDialog(true); }}>
                <Plus className="h-3 w-3" />{isAr ? "إضافة" : "Add"}
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{isAr ? "الاسم" : "Name"}</TableHead>
                    <TableHead>{isAr ? "الاسم (إنجليزي)" : "Name (EN)"}</TableHead>
                    <TableHead>{isAr ? "اللون" : "Color"}</TableHead>
                    <TableHead>{t("common.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(categories || []).map((c: any) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell className="text-muted-foreground">{c.nameEn || "-"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full border" style={{ backgroundColor: c.color || "#8B7355" }} />
                          <span className="text-xs text-muted-foreground">{c.color}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteCategory.mutate({ id: c.id })}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Discounts */}
        <TabsContent value="discounts" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">{isAr ? "الخصومات والعروض" : "Discounts & Offers"}</CardTitle>
              <Button size="sm" className="gap-1" onClick={() => { setEditDiscount(null); setDiscountForm({ name: "", nameEn: "", type: "percentage", value: "", minPurchase: "", maxUses: "", isActive: true, startDate: "", endDate: "" }); setShowDiscountDialog(true); }}>
                <Plus className="h-3 w-3" />{isAr ? "إضافة" : "Add"}
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{isAr ? "الاسم" : "Name"}</TableHead>
                    <TableHead>{isAr ? "النوع" : "Type"}</TableHead>
                    <TableHead>{isAr ? "القيمة" : "Value"}</TableHead>
                    <TableHead>{isAr ? "الحد الأدنى" : "Min Purchase"}</TableHead>
                    <TableHead>{t("common.status")}</TableHead>
                    <TableHead>{t("common.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(discounts || []).map((d: any) => (
                    <TableRow key={d.id}>
                      <TableCell className="font-medium">{isAr ? d.name : (d.nameEn || d.name)}</TableCell>
                      <TableCell className="text-sm">{d.type === "percentage" ? (isAr ? "نسبة" : "Percentage") : (isAr ? "مبلغ ثابت" : "Fixed")}</TableCell>
                      <TableCell className="font-medium">{d.type === "percentage" ? `${d.value}%` : `${d.value} ${isAr ? "ر.س" : "SAR"}`}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{d.minPurchase ? `${d.minPurchase} ${isAr ? "ر.س" : "SAR"}` : "-"}</TableCell>
                      <TableCell>
                        <span className={`text-xs font-medium ${d.isActive ? "text-green-600" : "text-muted-foreground"}`}>
                          {d.isActive ? (isAr ? "نشط" : "Active") : (isAr ? "معطل" : "Inactive")}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditDiscount(d); setDiscountForm({ name: d.name, nameEn: d.nameEn || "", type: d.type, value: d.value, minPurchase: d.minPurchase || "", maxUses: d.maxUses ? String(d.maxUses) : "", isActive: d.isActive, startDate: d.startDate ? String(d.startDate).split("T")[0] : "", endDate: d.endDate ? String(d.endDate).split("T")[0] : "" }); setShowDiscountDialog(true); }}>
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteDiscount.mutate({ id: d.id })}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Warehouse Dialog */}
      <Dialog open={showWarehouseDialog} onOpenChange={setShowWarehouseDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>{editWarehouse ? (isAr ? "تعديل المستودع" : "Edit Warehouse") : (isAr ? "إضافة مستودع" : "Add Warehouse")}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1"><Label>{isAr ? "الاسم (عربي)" : "Name (Arabic)"}</Label><Input value={warehouseForm.name} onChange={e => setWarehouseForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div className="space-y-1"><Label>{isAr ? "الاسم (إنجليزي)" : "Name (English)"}</Label><Input value={warehouseForm.nameEn} onChange={e => setWarehouseForm(f => ({ ...f, nameEn: e.target.value }))} dir="ltr" /></div>
            <div className="space-y-1"><Label>{isAr ? "الوصف" : "Description"}</Label><Input value={warehouseForm.description} onChange={e => setWarehouseForm(f => ({ ...f, description: e.target.value }))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWarehouseDialog(false)}>{t("common.cancel")}</Button>
            <Button onClick={handleWarehouseSubmit}>{t("common.save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Category Dialog */}
      <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>{isAr ? "إضافة تصنيف" : "Add Category"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1"><Label>{isAr ? "الاسم (عربي)" : "Name (Arabic)"}</Label><Input value={categoryForm.name} onChange={e => setCategoryForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div className="space-y-1"><Label>{isAr ? "الاسم (إنجليزي)" : "Name (English)"}</Label><Input value={categoryForm.nameEn} onChange={e => setCategoryForm(f => ({ ...f, nameEn: e.target.value }))} dir="ltr" /></div>
            <div className="space-y-1"><Label>{isAr ? "اللون" : "Color"}</Label><Input type="color" value={categoryForm.color} onChange={e => setCategoryForm(f => ({ ...f, color: e.target.value }))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCategoryDialog(false)}>{t("common.cancel")}</Button>
            <Button onClick={() => createCategory.mutateAsync(categoryForm)}>{t("common.save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Discount Dialog */}
      <Dialog open={showDiscountDialog} onOpenChange={setShowDiscountDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editDiscount ? (isAr ? "تعديل الخصم" : "Edit Discount") : (isAr ? "إضافة خصم" : "Add Discount")}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1"><Label>{isAr ? "الاسم (عربي)" : "Name (Arabic)"}</Label><Input value={discountForm.name} onChange={e => setDiscountForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div className="space-y-1"><Label>{isAr ? "الاسم (إنجليزي)" : "Name (English)"}</Label><Input value={discountForm.nameEn} onChange={e => setDiscountForm(f => ({ ...f, nameEn: e.target.value }))} dir="ltr" /></div>
            <div className="space-y-1">
              <Label>{isAr ? "النوع" : "Type"}</Label>
              <Select value={discountForm.type} onValueChange={(v: any) => setDiscountForm(f => ({ ...f, type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">{isAr ? "نسبة مئوية" : "Percentage"}</SelectItem>
                  <SelectItem value="fixed">{isAr ? "مبلغ ثابت" : "Fixed Amount"}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label>{isAr ? "القيمة" : "Value"}</Label><Input type="number" value={discountForm.value} onChange={e => setDiscountForm(f => ({ ...f, value: e.target.value }))} dir="ltr" /></div>
            <div className="space-y-1"><Label>{isAr ? "الحد الأدنى للشراء" : "Min Purchase"}</Label><Input type="number" value={discountForm.minPurchase} onChange={e => setDiscountForm(f => ({ ...f, minPurchase: e.target.value }))} dir="ltr" /></div>
            <div className="space-y-1"><Label>{isAr ? "الحد الأقصى للاستخدام" : "Max Uses"}</Label><Input type="number" value={discountForm.maxUses} onChange={e => setDiscountForm(f => ({ ...f, maxUses: e.target.value }))} dir="ltr" /></div>
            <div className="space-y-1"><Label>{isAr ? "تاريخ البداية" : "Start Date"}</Label><Input type="date" value={discountForm.startDate} onChange={e => setDiscountForm(f => ({ ...f, startDate: e.target.value }))} /></div>
            <div className="space-y-1"><Label>{isAr ? "تاريخ الانتهاء" : "End Date"}</Label><Input type="date" value={discountForm.endDate} onChange={e => setDiscountForm(f => ({ ...f, endDate: e.target.value }))} /></div>
            <div className="col-span-2 flex items-center gap-2">
              <Switch checked={discountForm.isActive} onCheckedChange={v => setDiscountForm(f => ({ ...f, isActive: v }))} />
              <Label>{isAr ? "خصم نشط" : "Active Discount"}</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDiscountDialog(false)}>{t("common.cancel")}</Button>
            <Button onClick={handleDiscountSubmit}>{t("common.save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
