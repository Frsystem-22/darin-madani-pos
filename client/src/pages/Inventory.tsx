import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Plus, Search, Edit, Trash2, Package, Barcode, Upload,
  ArrowUpDown, TrendingDown, Warehouse, RefreshCw, Eye, X, ImagePlus
} from "lucide-react";
import { cn } from "@/lib/utils";
import BarcodeLabel from "@/components/BarcodeLabel";

export default function Inventory() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const currency = isAr ? "ر.س" : "SAR";

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editProduct, setEditProduct] = useState<any>(null);
  const [showBarcodeDialog, setShowBarcodeDialog] = useState(false);
  const [barcodeProduct, setBarcodeProduct] = useState<any>(null);
  const [showStockDialog, setShowStockDialog] = useState(false);
  const [stockProduct, setStockProduct] = useState<any>(null);
  const [stockAction, setStockAction] = useState<"purchase" | "adjust" | "transfer">("purchase");
  const [uploadingImage, setUploadingImage] = useState(false);

  const { data: products, refetch } = trpc.products.list.useQuery({ search: search || undefined, categoryId: categoryFilter !== "all" ? parseInt(categoryFilter) : undefined });
  const { data: categories } = trpc.settings.getCategories.useQuery();
  const { data: warehouses } = trpc.settings.getWarehouses.useQuery();

  const createProduct = trpc.products.create.useMutation({ onSuccess: () => { refetch(); setShowAddDialog(false); toast.success(isAr ? "تم إضافة المنتج" : "Product added"); } });
  const updateProduct = trpc.products.update.useMutation({ onSuccess: () => { refetch(); setEditProduct(null); toast.success(isAr ? "تم تحديث المنتج" : "Product updated"); } });
  const deleteProduct = trpc.products.delete.useMutation({ onSuccess: () => { refetch(); toast.success(isAr ? "تم حذف المنتج" : "Product deleted"); } });
  const addPurchase = trpc.products.addPurchase.useMutation({ onSuccess: () => { refetch(); setShowStockDialog(false); toast.success(isAr ? "تم تحديث المخزون" : "Stock updated"); } });
  const adjustStock = trpc.products.adjustStock.useMutation({ onSuccess: () => { refetch(); setShowStockDialog(false); toast.success(isAr ? "تم تعديل المخزون" : "Stock adjusted"); } });
  const transferStock = trpc.products.transferStock.useMutation({ onSuccess: () => { refetch(); setShowStockDialog(false); toast.success(isAr ? "تم نقل المخزون" : "Stock transferred"); } });

  // Form state
  const [form, setForm] = useState({
    name: "", nameEn: "", description: "", descriptionEn: "",
    categoryId: "", color: "", colorEn: "", colorHex: "#000000",
    size: "", costPrice: "", salePrice: "", sku: "",
    lowStockAlert: "5", images: [] as string[],
    initialStock: [] as { warehouseId: number; qty: number }[],
  });

  const [stockForm, setStockForm] = useState({ warehouseId: "1", toWarehouseId: "2", qty: "1", costPrice: "", notes: "" });

  const resetForm = () => setForm({ name: "", nameEn: "", description: "", descriptionEn: "", categoryId: "", color: "", colorEn: "", colorHex: "#000000", size: "", costPrice: "", salePrice: "", sku: "", lowStockAlert: "5", images: [], initialStock: [] });

  const openEdit = (p: any) => {
    setForm({
      name: p.name || "", nameEn: p.nameEn || "", description: p.description || "",
      descriptionEn: p.descriptionEn || "", categoryId: String(p.categoryId || ""),
      color: p.color || "", colorEn: p.colorEn || "", colorHex: p.colorHex || "#000000",
      size: p.size || "", costPrice: String(p.costPrice || ""), salePrice: String(p.salePrice || ""),
      sku: p.sku || "", lowStockAlert: String(p.lowStockAlert || "5"),
      images: p.images || [], initialStock: [],
    });
    setEditProduct(p);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.salePrice) { toast.error(isAr ? "يرجى ملء الحقول المطلوبة" : "Fill required fields"); return; }
    const data: any = { ...form, categoryId: form.categoryId ? parseInt(form.categoryId) : undefined, lowStockAlert: parseInt(form.lowStockAlert) };
    if (editProduct) {
      await updateProduct.mutateAsync({ id: editProduct.id, ...data });
    } else {
      await createProduct.mutateAsync(data);
    }
  };

  const handleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadingImage(true);
    try {
      const newUrls: string[] = [];
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        if (!res.ok) throw new Error("Upload failed");
        const { url } = await res.json();
        newUrls.push(url);
      }
      setForm(f => ({ ...f, images: [...f.images, ...newUrls] }));
      toast.success(isAr ? `تم رفع ${newUrls.length} صورة` : `${newUrls.length} image(s) uploaded`);
    } catch (e: any) {
      toast.error(e.message || (isAr ? "فشل رفع الصورة" : "Upload failed"));
    } finally {
      setUploadingImage(false);
    }
  };

  const handleStockAction = async () => {
    if (!stockProduct) return;
    if (stockAction === "purchase") {
      await addPurchase.mutateAsync({ productId: stockProduct.id, warehouseId: parseInt(stockForm.warehouseId), qty: parseInt(stockForm.qty), costPrice: stockForm.costPrice || undefined, notes: stockForm.notes || undefined });
    } else if (stockAction === "adjust") {
      await adjustStock.mutateAsync({ productId: stockProduct.id, warehouseId: parseInt(stockForm.warehouseId), newQty: parseInt(stockForm.qty), notes: stockForm.notes || undefined });
    } else {
      await transferStock.mutateAsync({ productId: stockProduct.id, fromWarehouseId: parseInt(stockForm.warehouseId), toWarehouseId: parseInt(stockForm.toWarehouseId), qty: parseInt(stockForm.qty), notes: stockForm.notes || undefined });
    }
  };

  const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "XXXL", "34", "36", "38", "40", "42", "44", "46", "48", "Free Size"];

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("inventory.title")}</h1>
        <Button className="gap-2" onClick={() => { resetForm(); setShowAddDialog(true); }}>
          <Plus size={16} />
          {t("inventory.addProduct")}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder={t("common.search")} className="ps-9" />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder={t("inventory.category")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("common.all")}</SelectItem>
            {(categories || []).map((c: any) => (
              <SelectItem key={c.id} value={String(c.id)}>{isAr ? c.name : (c.nameEn || c.name)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Products table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("inventory.productName")}</TableHead>
                <TableHead>{t("inventory.category")}</TableHead>
                <TableHead>{t("inventory.color")} / {t("inventory.size")}</TableHead>
                <TableHead>{t("inventory.barcode")}</TableHead>
                <TableHead>{t("inventory.salePrice")}</TableHead>
                <TableHead>{t("inventory.totalStock")}</TableHead>
                <TableHead>{t("common.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(products || []).map((p: any) => {
                const isLow = p.totalQty <= (p.lowStockAlert || 5);
                return (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {p.images?.[0] ? (
                          <img src={p.images[0]} alt={p.name} className="w-8 h-8 rounded object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded bg-muted flex items-center justify-center">
                            <Package size={14} className="text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-sm">{isAr ? p.name : (p.nameEn || p.name)}</p>
                          {p.sku && <p className="text-xs text-muted-foreground">{p.sku}</p>}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {categories?.find((c: any) => c.id === p.categoryId)?.[isAr ? "name" : "nameEn"] || "-"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {p.color && <span className="flex items-center gap-1">
                        {p.colorHex && <span className="w-3 h-3 rounded-full border" style={{ background: p.colorHex }} />}
                        {isAr ? p.color : p.colorEn}
                      </span>}
                      {p.size && <span className="text-muted-foreground"> · {p.size}</span>}
                    </TableCell>
                    <TableCell className="text-xs font-mono text-muted-foreground">{p.barcode}</TableCell>
                    <TableCell className="font-medium text-primary">{Number(p.salePrice).toLocaleString()} {currency}</TableCell>
                    <TableCell>
                      <Badge variant={p.totalQty === 0 ? "destructive" : isLow ? "secondary" : "outline"}>
                        {p.totalQty}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(p)}>
                          <Edit size={13} />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setBarcodeProduct(p); setShowBarcodeDialog(true); }}>
                          <Barcode size={13} />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setStockProduct(p); setStockAction("purchase"); setStockForm({ warehouseId: "1", toWarehouseId: "2", qty: "1", costPrice: "", notes: "" }); setShowStockDialog(true); }}>
                          <ArrowUpDown size={13} />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => { if (confirm(isAr ? "هل تريد حذف هذا المنتج؟" : "Delete this product?")) deleteProduct.mutate({ id: p.id }); }}>
                          <Trash2 size={13} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {(!products || products.length === 0) && (
            <div className="py-12 text-center text-muted-foreground">
              <Package size={32} className="mx-auto mb-2 opacity-30" />
              <p>{t("common.noData")}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Product Dialog */}
      <Dialog open={showAddDialog || !!editProduct} onOpenChange={v => { if (!v) { setShowAddDialog(false); setEditProduct(null); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editProduct ? t("inventory.editProduct") : t("inventory.addProduct")}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>{t("inventory.productName")} *</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="اسم المنتج" />
            </div>
            <div className="space-y-1">
              <Label>{t("inventory.productNameEn")}</Label>
              <Input value={form.nameEn} onChange={e => setForm(f => ({ ...f, nameEn: e.target.value }))} placeholder="Product name" />
            </div>
            <div className="space-y-1">
              <Label>{t("inventory.category")}</Label>
              <Select value={form.categoryId} onValueChange={v => setForm(f => ({ ...f, categoryId: v }))}>
                <SelectTrigger><SelectValue placeholder={t("inventory.category")} /></SelectTrigger>
                <SelectContent>
                  {(categories || []).map((c: any) => <SelectItem key={c.id} value={String(c.id)}>{isAr ? c.name : (c.nameEn || c.name)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>{t("inventory.sku")}</Label>
              <Input value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} placeholder="SKU-001" />
            </div>
            <div className="space-y-1">
              <Label>{t("inventory.color")}</Label>
              <div className="flex gap-2">
                <Input value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} placeholder="أسود" />
                <input type="color" value={form.colorHex} onChange={e => setForm(f => ({ ...f, colorHex: e.target.value }))} className="w-10 h-9 rounded border border-input cursor-pointer" />
              </div>
            </div>
            <div className="space-y-1">
              <Label>{t("inventory.color")} (EN)</Label>
              <Input value={form.colorEn} onChange={e => setForm(f => ({ ...f, colorEn: e.target.value }))} placeholder="Black" />
            </div>
            <div className="space-y-1">
              <Label>{t("inventory.size")}</Label>
              <Select value={form.size} onValueChange={v => setForm(f => ({ ...f, size: v }))}>
                <SelectTrigger><SelectValue placeholder={t("inventory.size")} /></SelectTrigger>
                <SelectContent>
                  {SIZES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>{t("inventory.lowStockAlert")}</Label>
              <Input value={form.lowStockAlert} onChange={e => setForm(f => ({ ...f, lowStockAlert: e.target.value }))} type="number" min="0" />
            </div>
            <div className="space-y-1">
              <Label>{t("inventory.costPrice")}</Label>
              <Input value={form.costPrice} onChange={e => setForm(f => ({ ...f, costPrice: e.target.value }))} type="number" placeholder="0.00" />
            </div>
            <div className="space-y-1">
              <Label>{t("inventory.salePrice")} *</Label>
              <Input value={form.salePrice} onChange={e => setForm(f => ({ ...f, salePrice: e.target.value }))} type="number" placeholder="0.00" />
            </div>
            <div className="col-span-2 space-y-1">
              <Label>{t("inventory.description")}</Label>
              <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} />
            </div>
            {/* Product Images */}
            <div className="col-span-2 space-y-2">
              <Label className="flex items-center gap-2">
                <ImagePlus size={14} />
                {isAr ? "صور المنتج" : "Product Images"}
              </Label>
              <div className="flex flex-wrap gap-2">
                {form.images.map((url, idx) => (
                  <div key={idx} className="relative group">
                    <img src={url} alt={`img-${idx}`} className="w-20 h-20 object-cover rounded-lg border border-border" />
                    <button
                      type="button"
                      onClick={() => setForm(f => ({ ...f, images: f.images.filter((_, i) => i !== idx) }))}
                      className="absolute -top-1.5 -end-1.5 w-5 h-5 rounded-full bg-destructive text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
                <label className={cn(
                  "w-20 h-20 rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors",
                  uploadingImage && "opacity-50 cursor-wait"
                )}>
                  {uploadingImage ? (
                    <RefreshCw size={18} className="animate-spin text-muted-foreground" />
                  ) : (
                    <>
                      <Upload size={18} className="text-muted-foreground mb-1" />
                      <span className="text-[10px] text-muted-foreground text-center">{isAr ? "رفع صورة" : "Upload"}</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={e => handleImageUpload(e.target.files)}
                    disabled={uploadingImage}
                  />
                </label>
              </div>
              <p className="text-xs text-muted-foreground">{isAr ? "يمكنك رفع أكثر من صورة. الصورة الأولى ستظهر في القائمة." : "You can upload multiple images. First image shows in the list."}</p>
            </div>

            {/* Initial stock (only for new products) */}
            {!editProduct && (
              <div className="col-span-2 space-y-2">
                <Label>{isAr ? "الكمية الأولية" : "Initial Stock"}</Label>
                <div className="grid grid-cols-2 gap-2">
                  {(warehouses || []).map((w: any) => {
                    const s = form.initialStock.find(s => s.warehouseId === w.id);
                    return (
                      <div key={w.id} className="flex items-center gap-2">
                        <span className="text-sm flex-1">{isAr ? w.name : (w.nameEn || w.name)}</span>
                        <Input
                          type="number" min="0" className="w-20 h-8"
                          value={s?.qty || ""}
                          onChange={e => {
                            const qty = parseInt(e.target.value) || 0;
                            setForm(f => ({
                              ...f,
                              initialStock: s
                                ? f.initialStock.map(x => x.warehouseId === w.id ? { ...x, qty } : x)
                                : [...f.initialStock, { warehouseId: w.id, qty }]
                            }));
                          }}
                          placeholder="0"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowAddDialog(false); setEditProduct(null); }}>{t("common.cancel")}</Button>
            <Button onClick={handleSubmit} disabled={createProduct.isPending || updateProduct.isPending}>
              {t("common.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Barcode Dialog */}
      {showBarcodeDialog && barcodeProduct && (
        <BarcodeLabel product={barcodeProduct} onClose={() => setShowBarcodeDialog(false)} />
      )}

      {/* Stock Management Dialog */}
      <Dialog open={showStockDialog} onOpenChange={setShowStockDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{stockProduct?.name} - {isAr ? "إدارة المخزون" : "Stock Management"}</DialogTitle>
          </DialogHeader>
          <Tabs value={stockAction} onValueChange={(v: any) => setStockAction(v)}>
            <TabsList className="w-full">
              <TabsTrigger value="purchase" className="flex-1">{t("inventory.addPurchase")}</TabsTrigger>
              <TabsTrigger value="adjust" className="flex-1">{t("inventory.adjustStock")}</TabsTrigger>
              <TabsTrigger value="transfer" className="flex-1">{t("inventory.transferStock")}</TabsTrigger>
            </TabsList>
            <TabsContent value="purchase" className="space-y-3 mt-3">
              <div className="space-y-1">
                <Label>{t("warehouse.title")}</Label>
                <Select value={stockForm.warehouseId} onValueChange={v => setStockForm(f => ({ ...f, warehouseId: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{(warehouses || []).map((w: any) => <SelectItem key={w.id} value={String(w.id)}>{isAr ? w.name : (w.nameEn || w.name)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>{t("common.qty")}</Label>
                <Input type="number" min="1" value={stockForm.qty} onChange={e => setStockForm(f => ({ ...f, qty: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label>{t("inventory.costPrice")}</Label>
                <Input type="number" value={stockForm.costPrice} onChange={e => setStockForm(f => ({ ...f, costPrice: e.target.value }))} placeholder="0.00" />
              </div>
            </TabsContent>
            <TabsContent value="adjust" className="space-y-3 mt-3">
              <div className="space-y-1">
                <Label>{t("warehouse.title")}</Label>
                <Select value={stockForm.warehouseId} onValueChange={v => setStockForm(f => ({ ...f, warehouseId: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{(warehouses || []).map((w: any) => <SelectItem key={w.id} value={String(w.id)}>{isAr ? w.name : (w.nameEn || w.name)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>{isAr ? "الكمية الجديدة" : "New Quantity"}</Label>
                <Input type="number" min="0" value={stockForm.qty} onChange={e => setStockForm(f => ({ ...f, qty: e.target.value }))} />
              </div>
            </TabsContent>
            <TabsContent value="transfer" className="space-y-3 mt-3">
              <div className="space-y-1">
                <Label>{t("warehouse.from")}</Label>
                <Select value={stockForm.warehouseId} onValueChange={v => setStockForm(f => ({ ...f, warehouseId: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{(warehouses || []).map((w: any) => <SelectItem key={w.id} value={String(w.id)}>{isAr ? w.name : (w.nameEn || w.name)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>{t("warehouse.to")}</Label>
                <Select value={stockForm.toWarehouseId} onValueChange={v => setStockForm(f => ({ ...f, toWarehouseId: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{(warehouses || []).map((w: any) => <SelectItem key={w.id} value={String(w.id)}>{isAr ? w.name : (w.nameEn || w.name)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>{t("common.qty")}</Label>
                <Input type="number" min="1" value={stockForm.qty} onChange={e => setStockForm(f => ({ ...f, qty: e.target.value }))} />
              </div>
            </TabsContent>
          </Tabs>
          <div className="space-y-1">
            <Label>{t("common.notes")}</Label>
            <Input value={stockForm.notes} onChange={e => setStockForm(f => ({ ...f, notes: e.target.value }))} placeholder={isAr ? "ملاحظات..." : "Notes..."} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStockDialog(false)}>{t("common.cancel")}</Button>
            <Button onClick={handleStockAction}>{t("common.save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
