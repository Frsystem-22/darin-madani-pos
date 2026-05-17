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
import { Plus, Trash2, Edit, Save, Store, MessageCircle, CreditCard, Package, Tag, Palette, Ruler } from "lucide-react";
import WhatsAppSetup from "@/components/WhatsAppSetup";

export default function Settings() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";

  const { data: settings, refetch: refetchSettings } = trpc.settings.get.useQuery();
  const { data: warehouses, refetch: refetchWarehouses } = trpc.settings.getWarehouses.useQuery();
  const { data: categories, refetch: refetchCategories } = trpc.settings.getCategories.useQuery();
  const { data: discounts, refetch: refetchDiscounts } = trpc.settings.getDiscounts.useQuery();
  const { data: colors, refetch: refetchColors } = trpc.settings.getColors.useQuery();
  const { data: sizes, refetch: refetchSizes } = trpc.settings.getSizes.useQuery();

  const updateSettings = trpc.settings.update.useMutation({ onSuccess: () => { refetchSettings(); toast.success(isAr ? "تم حفظ الإعدادات" : "Settings saved"); } });
  const createWarehouse = trpc.settings.createWarehouse.useMutation({ onSuccess: () => { refetchWarehouses(); setShowWarehouseDialog(false); } });
  const updateWarehouse = trpc.settings.updateWarehouse.useMutation({ onSuccess: () => { refetchWarehouses(); setShowWarehouseDialog(false); } });
  const deleteWarehouse = trpc.settings.deleteWarehouse.useMutation({ onSuccess: () => refetchWarehouses() });
  const createCategory = trpc.settings.createCategory.useMutation({ onSuccess: () => { refetchCategories(); setShowCategoryDialog(false); } });
  const deleteCategory = trpc.settings.deleteCategory.useMutation({ onSuccess: () => refetchCategories() });
  const createDiscount = trpc.settings.createDiscount.useMutation({ onSuccess: () => { refetchDiscounts(); setShowDiscountDialog(false); } });
  const updateDiscount = trpc.settings.updateDiscount.useMutation({ onSuccess: () => { refetchDiscounts(); setShowDiscountDialog(false); } });
  const deleteDiscount = trpc.settings.deleteDiscount.useMutation({ onSuccess: () => refetchDiscounts() });
  const createColor = trpc.settings.createColor.useMutation({ onSuccess: () => { refetchColors(); setShowColorDialog(false); } });
  const updateColor = trpc.settings.updateColor.useMutation({ onSuccess: () => { refetchColors(); setShowColorDialog(false); } });
  const deleteColor = trpc.settings.deleteColor.useMutation({ onSuccess: () => refetchColors() });
  const createSize = trpc.settings.createSize.useMutation({ onSuccess: () => { refetchSizes(); setShowSizeDialog(false); } });
  const updateSize = trpc.settings.updateSize.useMutation({ onSuccess: () => { refetchSizes(); setShowSizeDialog(false); } });
  const deleteSize = trpc.settings.deleteSize.useMutation({ onSuccess: () => refetchSizes() });

  const [form, setForm] = useState<any>({});
  const [showWarehouseDialog, setShowWarehouseDialog] = useState(false);
  const [editWarehouse, setEditWarehouse] = useState<any>(null);
  const [warehouseForm, setWarehouseForm] = useState({ name: "", nameEn: "", description: "" });
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [categoryForm, setCategoryForm] = useState({ name: "", nameEn: "" });
  const [showDiscountDialog, setShowDiscountDialog] = useState(false);
  const [editDiscount, setEditDiscount] = useState<any>(null);
  const [discountForm, setDiscountForm] = useState({ name: "", nameEn: "", type: "percentage" as "percentage" | "fixed", value: "", minPurchase: "", maxUses: "", isActive: true, startDate: "", endDate: "" });
  // Colors
  const [showColorDialog, setShowColorDialog] = useState(false);
  const [editColor, setEditColor] = useState<any>(null);
  const [colorForm, setColorForm] = useState({ name: "", nameEn: "", hex: "#000000", sortOrder: "" });
  // Sizes
  const [showSizeDialog, setShowSizeDialog] = useState(false);
  const [editSize, setEditSize] = useState<any>(null);
  const [sizeForm, setSizeForm] = useState({ name: "", nameEn: "", sortOrder: "" });

  useEffect(() => {
    if (settings) setForm(settings);
  }, [settings]);

  const handleSave = async () => {
    const allowedFields = [
      "storeName", "storeNameEn", "storePhone", "storeEmail",
      "storeAddress", "storeAddressEn", "storeLogo",
      "taxNumber", "taxRate", "currency", "currencySymbol",
      "invoiceNote", "invoiceNoteEn",
      "whatsappEnabled", "whatsappInstance", "whatsappApiKey", "whatsappApiBase", "whatsappTemplate",
      "myfatoorahEnabled", "myfatoorahToken", "myfatoorahEnv", "myfatoorahSupplier",
      "priceIncludesTax",
    ];
    const payload: any = {};
    for (const key of allowedFields) {
      const val = form[key];
      if (val !== undefined && val !== null) payload[key] = val;
    }
    try {
      await updateSettings.mutateAsync(payload);
    } catch (err: any) {
      toast.error(isAr ? `فشل الحفظ: ${err?.message || "خطأ غير متوقع"}` : `Save failed: ${err?.message || "Unexpected error"}`);
    }
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

  const handleColorSubmit = async () => {
    const data = { name: colorForm.name, nameEn: colorForm.nameEn || undefined, hex: colorForm.hex || "#000000", sortOrder: colorForm.sortOrder ? parseInt(colorForm.sortOrder) : undefined };
    if (editColor) {
      await updateColor.mutateAsync({ id: editColor.id, ...data });
    } else {
      await createColor.mutateAsync(data);
    }
  };

  const handleSizeSubmit = async () => {
    const data = { name: sizeForm.name, nameEn: sizeForm.nameEn || undefined, sortOrder: sizeForm.sortOrder ? parseInt(sizeForm.sortOrder) : undefined };
    if (editSize) {
      await updateSize.mutateAsync({ id: editSize.id, ...data });
    } else {
      await createSize.mutateAsync(data);
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
          <TabsTrigger value="colors" className="gap-1"><Palette className="h-3 w-3" />{isAr ? "الألوان" : "Colors"}</TabsTrigger>
          <TabsTrigger value="sizes" className="gap-1"><Ruler className="h-3 w-3" />{isAr ? "المقاسات" : "Sizes"}</TabsTrigger>
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
                <div className="space-y-1 flex items-center gap-2 pt-5">
                  <Switch checked={!!(form.priceIncludesTax) && (form.priceIncludesTax as any) !== 0 && (form.priceIncludesTax as any) !== "0"} onCheckedChange={v => setForm((f: any) => ({ ...f, priceIncludesTax: v }))} />
                  <Label className="cursor-pointer">{isAr ? "الأسعار شاملة الضريبة" : "Prices include tax"}</Label>
                </div>
                <div className="space-y-1">
                  <Label>{isAr ? "رمز العملة" : "Currency Symbol"}</Label>
                  <Input value={form.currencySymbol || "ر.س"} onChange={e => setForm((f: any) => ({ ...f, currencySymbol: e.target.value }))} />
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
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <span className="text-[#25d366] text-xl">📱</span>
                  {isAr ? "ربط واتساب مباشرة" : "Connect WhatsApp Directly"}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {isAr ? "ادخل بيانات Evolution API ثم امسح QR Code من هاتفك" : "Enter Evolution API credentials then scan QR Code from your phone"}
                </p>
              </CardHeader>
              <CardContent>
                <WhatsAppSetup />
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">{isAr ? "قالب رسالة الفاتورة" : "Invoice Message Template"}</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <Label>{isAr ? "نص الرسالة" : "Message Text"}</Label>
                  <Textarea value={form.whatsappTemplate || ""} onChange={e => setForm((f: any) => ({ ...f, whatsappTemplate: e.target.value }))} rows={4} dir="rtl" placeholder={"🛍️ شكراً لتسوقك في *{storeName}*\n\nفاتورة رقم: *{invoiceNumber}*\nالإجمالي: *{total} ر.س*\n\n📄 رابط الفاتورة:\n{invoiceUrl}"} />
                  <p className="text-xs text-muted-foreground">{isAr ? "المتغيرات: {storeName} {invoiceNumber} {total} {invoiceUrl}" : "Variables: {storeName} {invoiceNumber} {total} {invoiceUrl}"}</p>
                </div>
                <Button onClick={handleSave} className="gap-2"><Save className="h-4 w-4" />{t("common.save")}</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Payment Settings */}
        <TabsContent value="payment" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">{isAr ? "إعدادات MyFatoorah" : "MyFatoorah Settings"}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Switch checked={form.myfatoorahEnabled !== false} onCheckedChange={v => setForm((f: any) => ({ ...f, myfatoorahEnabled: v }))} />
                <Label>{isAr ? "تفعيل MyFatoorah" : "Enable MyFatoorah"}</Label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>{isAr ? "البيئة" : "Environment"}</Label>
                  <Select value={form.myfatoorahEnv || "sandbox"} onValueChange={v => setForm((f: any) => ({ ...f, myfatoorahEnv: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sandbox">{isAr ? "تجريبي (Sandbox)" : "Sandbox (Test)"}</SelectItem>
                      <SelectItem value="live">{isAr ? "حقيقي (Live)" : "Live (Production)"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>{isAr ? "كود المورد (Supplier Code)" : "Supplier Code"}</Label>
                  <div className="flex items-center gap-2">
                    <Input value="24" disabled dir="ltr" className="bg-muted font-mono" />
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{isAr ? "ثابت" : "Fixed"}</span>
                  </div>
                </div>
                <div className="col-span-2 space-y-1">
                  <Label>{isAr ? "Master Token (API)" : "Master API Token"}</Label>
                  <Input value={form.myfatoorahToken || ""} onChange={e => setForm((f: any) => ({ ...f, myfatoorahToken: e.target.value }))} type="password" dir="ltr" placeholder="rLtt6JWvbUHDDhsZnfpAhpYk4dxYDQkbcPTyGaKp..." />
                  <p className="text-xs text-muted-foreground">{isAr ? "احصل عليه من لوحة تحكم MyFatoorah تحت API Settings" : "Get it from MyFatoorah dashboard under API Settings"}</p>
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
              <Button size="sm" className="gap-1" onClick={() => { setCategoryForm({ name: "", nameEn: "" }); setShowCategoryDialog(true); }}>
                <Plus className="h-3 w-3" />{isAr ? "إضافة" : "Add"}
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{isAr ? "الاسم" : "Name"}</TableHead>
                    <TableHead>{isAr ? "الاسم (إنجليزي)" : "Name (EN)"}</TableHead>
                    <TableHead>{t("common.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(categories || []).map((c: any) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell className="text-muted-foreground">{c.nameEn || "-"}</TableCell>
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

        {/* Colors */}
        <TabsContent value="colors" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">{isAr ? "ألوان المنتجات" : "Product Colors"}</CardTitle>
              <Button size="sm" className="gap-1" onClick={() => { setEditColor(null); setColorForm({ name: "", nameEn: "", hex: "#000000", sortOrder: "" }); setShowColorDialog(true); }}>
                <Plus className="h-3 w-3" />{isAr ? "إضافة لون" : "Add Color"}
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">{isAr ? "اللون" : "Color"}</TableHead>
                    <TableHead>{isAr ? "الاسم (عربي)" : "Name (AR)"}</TableHead>
                    <TableHead>{isAr ? "الاسم (إنجليزي)" : "Name (EN)"}</TableHead>
                    <TableHead>{isAr ? "كود HEX" : "HEX Code"}</TableHead>
                    <TableHead>{t("common.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(colors || []).map((c: any) => (
                    <TableRow key={c.id}>
                      <TableCell>
                        <span className="w-8 h-8 rounded-full border-2 border-border inline-block" style={{ backgroundColor: c.hex || "#cccccc" }} />
                      </TableCell>
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell className="text-muted-foreground">{c.nameEn || "-"}</TableCell>
                      <TableCell className="font-mono text-sm text-muted-foreground">{c.hex || "-"}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditColor(c); setColorForm({ name: c.name, nameEn: c.nameEn || "", hex: c.hex || "#000000", sortOrder: c.sortOrder ? String(c.sortOrder) : "" }); setShowColorDialog(true); }}>
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteColor.mutate({ id: c.id })}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!colors || colors.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        {isAr ? "لا توجد ألوان مضافة بعد" : "No colors added yet"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sizes */}
        <TabsContent value="sizes" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">{isAr ? "مقاسات المنتجات" : "Product Sizes"}</CardTitle>
              <Button size="sm" className="gap-1" onClick={() => { setEditSize(null); setSizeForm({ name: "", nameEn: "", sortOrder: "" }); setShowSizeDialog(true); }}>
                <Plus className="h-3 w-3" />{isAr ? "إضافة مقاس" : "Add Size"}
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{isAr ? "المقاس" : "Size"}</TableHead>
                    <TableHead>{isAr ? "الاسم (إنجليزي)" : "Name (EN)"}</TableHead>
                    <TableHead>{isAr ? "الترتيب" : "Order"}</TableHead>
                    <TableHead>{t("common.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(sizes || []).map((s: any) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium font-mono">{s.name}</TableCell>
                      <TableCell className="text-muted-foreground">{s.nameEn || "-"}</TableCell>
                      <TableCell className="text-muted-foreground">{s.sortOrder ?? "-"}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditSize(s); setSizeForm({ name: s.name, nameEn: s.nameEn || "", sortOrder: s.sortOrder ? String(s.sortOrder) : "" }); setShowSizeDialog(true); }}>
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteSize.mutate({ id: s.id })}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!sizes || sizes.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                        {isAr ? "لا توجد مقاسات مضافة بعد" : "No sizes added yet"}
                      </TableCell>
                    </TableRow>
                  )}
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

      {/* Color Dialog */}
      <Dialog open={showColorDialog} onOpenChange={setShowColorDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>{editColor ? (isAr ? "تعديل اللون" : "Edit Color") : (isAr ? "إضافة لون" : "Add Color")}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>{isAr ? "الاسم (عربي)" : "Name (Arabic)"} <span className="text-destructive">*</span></Label>
              <Input value={colorForm.name} onChange={e => setColorForm(f => ({ ...f, name: e.target.value }))} placeholder={isAr ? "أسود" : "Black"} />
            </div>
            <div className="space-y-1">
              <Label>{isAr ? "الاسم (إنجليزي)" : "Name (English)"}</Label>
              <Input value={colorForm.nameEn} onChange={e => setColorForm(f => ({ ...f, nameEn: e.target.value }))} placeholder="Black" dir="ltr" />
            </div>
            <div className="space-y-1">
              <Label>{isAr ? "كود اللون (HEX)" : "Color Code (HEX)"}</Label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={colorForm.hex}
                  onChange={e => setColorForm(f => ({ ...f, hex: e.target.value }))}
                  className="w-12 h-10 rounded border border-input cursor-pointer"
                />
                <Input
                  value={colorForm.hex}
                  onChange={e => setColorForm(f => ({ ...f, hex: e.target.value }))}
                  placeholder="#000000"
                  dir="ltr"
                  className="font-mono"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label>{isAr ? "الترتيب" : "Sort Order"}</Label>
              <Input type="number" value={colorForm.sortOrder} onChange={e => setColorForm(f => ({ ...f, sortOrder: e.target.value }))} placeholder="0" dir="ltr" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowColorDialog(false)}>{t("common.cancel")}</Button>
            <Button onClick={handleColorSubmit} disabled={!colorForm.name.trim()}>{t("common.save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Size Dialog */}
      <Dialog open={showSizeDialog} onOpenChange={setShowSizeDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>{editSize ? (isAr ? "تعديل المقاس" : "Edit Size") : (isAr ? "إضافة مقاس" : "Add Size")}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>{isAr ? "المقاس" : "Size"} <span className="text-destructive">*</span></Label>
              <Input value={sizeForm.name} onChange={e => setSizeForm(f => ({ ...f, name: e.target.value }))} placeholder="XL, 42, Free Size..." dir="ltr" />
            </div>
            <div className="space-y-1">
              <Label>{isAr ? "الاسم (إنجليزي)" : "Name (English)"}</Label>
              <Input value={sizeForm.nameEn} onChange={e => setSizeForm(f => ({ ...f, nameEn: e.target.value }))} placeholder="Extra Large" dir="ltr" />
            </div>
            <div className="space-y-1">
              <Label>{isAr ? "الترتيب" : "Sort Order"}</Label>
              <Input type="number" value={sizeForm.sortOrder} onChange={e => setSizeForm(f => ({ ...f, sortOrder: e.target.value }))} placeholder="0" dir="ltr" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSizeDialog(false)}>{t("common.cancel")}</Button>
            <Button onClick={handleSizeSubmit} disabled={!sizeForm.name.trim()}>{t("common.save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
