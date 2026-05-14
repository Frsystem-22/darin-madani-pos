import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Printer, Search, Minus, Plus, Hash, Info } from "lucide-react";
import JsBarcode from "jsbarcode";
import { toast } from "sonner";

function sanitizeBarcode(raw: string): string {
  return raw.replace(/[^\x20-\x7E]/g, "").trim() || "0000000000";
}

function buildVariantBarcode(product: any): string {
  const sku = product.sku || product.barcode || String(product.id).padStart(10, "0");
  const parts = [sanitizeBarcode(sku)];
  if (product.colorEn) {
    parts.push(product.colorEn.slice(0, 3).toUpperCase());
  } else if (product.color) {
    const colorMap: Record<string, string> = {
      "أسود": "BLK", "أبيض": "WHT", "أحمر": "RED", "أزرق": "BLU",
      "أخضر": "GRN", "أصفر": "YLW", "بنفسجي": "PRP", "وردي": "PNK",
      "بيج": "BEG", "رمادي": "GRY", "بني": "BRN", "ذهبي": "GLD",
      "فضي": "SLV", "برتقالي": "ORG",
    };
    const code = colorMap[product.color] || product.color.slice(0, 3).replace(/[^\x20-\x7E]/g, "X");
    parts.push(code);
  }
  if (product.size) {
    const sizeClean = product.size.replace(/[^\x20-\x7E]/g, "").trim();
    if (sizeClean) parts.push(sizeClean);
  }
  return sanitizeBarcode(parts.join("-"));
}

function buildSerialBarcode(variantBarcode: string, serial: number): string {
  return sanitizeBarcode(`${variantBarcode}-${String(serial).padStart(3, "0")}`);
}

interface SelectedProduct {
  product: any;
  qty: number;
}

function BarcodePreview({ barcode }: { barcode: string }) {
  const svgRef = useRef<SVGSVGElement>(null);
  useEffect(() => {
    if (svgRef.current) {
      try {
        JsBarcode(svgRef.current, barcode, {
          format: "CODE128", width: 1.2, height: 30,
          displayValue: true, fontSize: 8, margin: 3,
          background: "#ffffff", lineColor: "#000000",
        });
      } catch (e) {}
    }
  }, [barcode]);
  return <svg ref={svgRef} className="w-full" />;
}

export default function BarcodePrint() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const currency = isAr ? "ر.س" : "SAR";
  const [search, setSearch] = useState("");
  const [labelSize, setLabelSize] = useState<"58mm" | "80mm">("58mm");
  const [selected, setSelected] = useState<Record<number, SelectedProduct>>({});
  const [isPrinting, setIsPrinting] = useState(false);

  const { data: productsData } = trpc.products.list.useQuery({});
  const reserveSerials = trpc.products.reserveSerials.useMutation();

  const products: any[] = (productsData as any) || [];
  const filtered = products.filter(p => {
    const q = search.toLowerCase();
    return (
      p.name?.toLowerCase().includes(q) ||
      p.nameEn?.toLowerCase().includes(q) ||
      p.barcode?.toLowerCase().includes(q) ||
      p.sku?.toLowerCase().includes(q)
    );
  });

  const selectedList = Object.values(selected);
  const totalLabels = selectedList.reduce((s, x) => s + x.qty, 0);

  const toggleProduct = (p: any) => {
    setSelected(prev => {
      if (prev[p.id]) { const next = { ...prev }; delete next[p.id]; return next; }
      return { ...prev, [p.id]: { product: p, qty: 1 } };
    });
  };

  const setQty = (id: number, val: number) => {
    setSelected(prev => ({ ...prev, [id]: { ...prev[id], qty: Math.max(1, val) } }));
  };

  const selectAll = () => {
    const next: Record<number, SelectedProduct> = {};
    filtered.forEach(p => { next[p.id] = selected[p.id] || { product: p, qty: 1 }; });
    setSelected(next);
  };

  const clearAll = () => setSelected({});

  const handlePrint = async () => {
    if (selectedList.length === 0) return;
    setIsPrinting(true);
    try {
      const printItems: { product: any; serials: number[] }[] = [];
      for (const { product, qty } of selectedList) {
        const variantBarcode = buildVariantBarcode(product);
        const result = await reserveSerials.mutateAsync({ variantBarcode, qty });
        printItems.push({ product, serials: result.serials });
      }

      const printWindow = window.open("", "_blank");
      if (!printWindow) { toast.error(isAr ? "تعذّر فتح نافذة الطباعة" : "Could not open print window"); return; }

      const labelWidth = labelSize === "58mm" ? "54mm" : "76mm";
      let labelsHtml = "";
      let initScript = "";
      let idx = 0;

      for (const { product, serials } of printItems) {
        const variantBarcode = buildVariantBarcode(product);
        const productName = isAr ? product.name : (product.nameEn || product.name);
        const colorText = isAr ? product.color : (product.colorEn || product.color);

        for (const serial of serials) {
          const serialBarcode = buildSerialBarcode(variantBarcode, serial);
          const svgId = `bc${idx}`;
          labelsHtml += `
            <div class="label">
              <div class="store-name">DARIN MADANI</div>
              <div class="product-name">${productName}</div>
              ${(colorText || product.size) ? `<div class="detail">${[colorText, product.size].filter(Boolean).join(" · ")}</div>` : ""}
              <div class="price">${Number(product.salePrice).toLocaleString()} ${currency}</div>
              <svg id="${svgId}" class="barcode-svg"></svg>
              <div class="barcode-num">${serialBarcode}</div>
            </div>
          `;
          initScript += `try { JsBarcode(document.getElementById('${svgId}'), '${serialBarcode}', {format:'CODE128',width:1.2,height:28,displayValue:false,margin:2}); } catch(e){}\n`;
          idx++;
        }
      }

      printWindow.document.write(`<!DOCTYPE html>
<html dir="${isAr ? "rtl" : "ltr"}">
<head>
  <meta charset="UTF-8"><title>Barcode Labels</title>
  <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js"><\/script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; background: white; }
    .labels-container { display: flex; flex-wrap: wrap; gap: 2mm; padding: 2mm; }
    .label { width: ${labelWidth}; border: 0.5px solid #ccc; padding: 2mm 2mm 1mm; display: flex; flex-direction: column; align-items: center; page-break-inside: avoid; }
    .store-name { font-size: 6.5pt; font-weight: bold; letter-spacing: 1.5px; color: #8B7355; margin-bottom: 0.5mm; }
    .product-name { font-size: 8pt; font-weight: bold; text-align: center; margin-bottom: 0.5mm; line-height: 1.2; }
    .detail { font-size: 6.5pt; color: #555; margin-bottom: 0.5mm; }
    .price { font-size: 10pt; font-weight: bold; color: #8B7355; margin-bottom: 1mm; }
    .barcode-svg { width: 100%; max-height: 10mm; }
    .barcode-num { font-size: 5.5pt; color: #666; margin-top: 0.5mm; font-family: monospace; letter-spacing: 0.5px; }
    @media print { body { margin: 0; } .labels-container { gap: 1mm; padding: 1mm; } }
  </style>
</head>
<body>
  <div class="labels-container">${labelsHtml}</div>
  <script>
    window.onload = function() {
      ${initScript}
      setTimeout(function() { window.print(); window.close(); }, 700);
    };
  <\/script>
</body>
</html>`);
      printWindow.document.close();
      toast.success(isAr ? `تم طباعة ${totalLabels} ستيكر بأرقام تسلسلية فريدة` : `Printed ${totalLabels} labels with unique serial numbers`);
    } catch (e: any) {
      toast.error(e.message || (isAr ? "فشل في حجز الأرقام التسلسلية" : "Failed to reserve serial numbers"));
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-5" dir={isAr ? "rtl" : "ltr"}>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">{t("barcode.title")}</h1>
          <p className="text-sm text-muted-foreground mt-0.5 flex items-center gap-1.5">
            <Hash size={13} />
            {isAr ? "كل قطعة تحصل على باركود فريد متسلسل: SKU-لون-مقاس-001" : "Each piece gets a unique sequential barcode: SKU-Color-Size-001"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-sm">{t("barcode.labelSize")}</Label>
          <Select value={labelSize} onValueChange={(v: any) => setLabelSize(v)}>
            <SelectTrigger className="w-24 h-8"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="58mm">58mm</SelectItem>
              <SelectItem value="80mm">80mm</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* قائمة المنتجات */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search size={14} className="absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input value={search} onChange={e => setSearch(e.target.value)} placeholder={t("common.search")} className="ps-9 h-9" />
            </div>
            <Button variant="outline" size="sm" onClick={selectAll} className="shrink-0 h-9">{isAr ? "تحديد الكل" : "Select All"}</Button>
            <Button variant="ghost" size="sm" onClick={clearAll} className="shrink-0 h-9">{isAr ? "مسح" : "Clear"}</Button>
          </div>

          <div className="border rounded-xl divide-y overflow-hidden max-h-[60vh] overflow-y-auto">
            {filtered.length === 0 && (
              <div className="py-10 text-center text-muted-foreground text-sm">{isAr ? "لا توجد منتجات" : "No products found"}</div>
            )}
            {filtered.map(p => {
              const isChecked = !!selected[p.id];
              const variantBarcode = buildVariantBarcode(p);
              return (
                <div
                  key={p.id}
                  className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/50 transition-colors ${isChecked ? "bg-primary/5" : ""}`}
                  onClick={() => toggleProduct(p)}
                >
                  <Checkbox checked={isChecked} onCheckedChange={() => toggleProduct(p)} onClick={e => e.stopPropagation()} />
                  {p.images?.[0] ? (
                    <img src={p.images[0]} alt={p.name} className="w-9 h-9 rounded object-cover shrink-0" />
                  ) : (
                    <div className="w-9 h-9 rounded bg-muted shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{isAr ? p.name : (p.nameEn || p.name)}</p>
                    <p className="text-xs text-muted-foreground font-mono">{variantBarcode}</p>
                    {(p.color || p.size) && (
                      <p className="text-xs text-muted-foreground">{[isAr ? p.color : p.colorEn, p.size].filter(Boolean).join(" · ")}</p>
                    )}
                  </div>
                  <div className="text-sm font-semibold text-amber-700 shrink-0">{Number(p.salePrice).toLocaleString()} {currency}</div>
                  {isChecked && (
                    <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                      <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setQty(p.id, (selected[p.id]?.qty || 1) - 1)}><Minus size={12} /></Button>
                      <Input type="number" min="1" max="500" value={selected[p.id]?.qty || 1} onChange={e => setQty(p.id, parseInt(e.target.value) || 1)} className="w-14 h-7 text-center text-sm px-1" />
                      <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setQty(p.id, (selected[p.id]?.qty || 1) + 1)}><Plus size={12} /></Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ملخص المحدد */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm">{isAr ? `المحدد (${selectedList.length} منتج)` : `Selected (${selectedList.length} products)`}</h3>
          {selectedList.length === 0 ? (
            <div className="border rounded-xl p-6 text-center text-muted-foreground text-sm">{isAr ? "لم تحدد أي منتج بعد" : "No products selected yet"}</div>
          ) : (
            <div className="border rounded-xl divide-y overflow-hidden">
              {selectedList.map(({ product, qty }) => {
                const variantBarcode = buildVariantBarcode(product);
                return (
                  <div key={product.id} className="p-3 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{isAr ? product.name : (product.nameEn || product.name)}</p>
                        <p className="text-xs text-muted-foreground font-mono">{variantBarcode}</p>
                      </div>
                      <Badge variant="secondary" className="shrink-0">{qty} {isAr ? "قطعة" : "pcs"}</Badge>
                    </div>
                    <div className="bg-white rounded border p-2">
                      <BarcodePreview barcode={buildSerialBarcode(variantBarcode, 1)} />
                      <p className="text-center text-[10px] text-muted-foreground mt-1">
                        {isAr ? `مثال: ${buildSerialBarcode(variantBarcode, 1)}` : `Example: ${buildSerialBarcode(variantBarcode, 1)}`}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {selectedList.length > 0 && (
            <div className="bg-amber-50 dark:bg-amber-950/20 rounded-xl p-4 space-y-2 border border-amber-200 dark:border-amber-800">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{isAr ? "عدد المنتجات" : "Products"}</span>
                <span className="font-medium">{selectedList.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{isAr ? "إجمالي الستيكرات" : "Total labels"}</span>
                <span className="font-bold text-amber-700">{totalLabels}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{isAr ? "حجم الملصق" : "Label size"}</span>
                <span className="font-medium">{labelSize}</span>
              </div>
              <div className="flex items-start gap-1.5 pt-1 border-t border-amber-200 dark:border-amber-800">
                <Info size={12} className="text-amber-600 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  {isAr ? "كل قطعة ستحصل على رقم تسلسلي فريد لا يتكرر أبداً" : "Each piece will receive a unique serial number that never repeats"}
                </p>
              </div>
            </div>
          )}

          {selectedList.length > 0 && (
            <Button onClick={handlePrint} disabled={isPrinting} className="w-full gap-2 bg-[#C9A96E] hover:bg-[#b8944f] text-white">
              <Printer size={15} />
              {isPrinting
                ? (isAr ? "جاري الحجز والطباعة..." : "Reserving & printing...")
                : (isAr ? `طباعة ${totalLabels} ستيكر متسلسل` : `Print ${totalLabels} sequential label${totalLabels !== 1 ? "s" : ""}`)}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
