import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Printer } from "lucide-react";
import JsBarcode from "jsbarcode";

interface BarcodeLabelProps {
  product: {
    id: number;
    name: string;
    nameEn?: string;
    barcode?: string;
    sku?: string;
    color?: string;
    colorEn?: string;
    size?: string;
    salePrice: string;
  };
  onClose: () => void;
}

/** تنظيف الباركود ليحتوي فقط على أحرف CODE128 صالحة */
function sanitizeBarcode(raw: string): string {
  // إزالة أي حرف خارج نطاق ASCII 32-126
  return raw.replace(/[^\x20-\x7E]/g, "").trim() || "0000000000";
}

/** بناء باركود من SKU + لون + مقاس */
function buildBarcode(product: BarcodeLabelProps["product"]): string {
  const sku = product.sku || product.barcode || String(product.id).padStart(10, "0");
  // إذا كان الباركود الموجود يحتوي على عربي، نبني واحداً جديداً من SKU فقط
  const parts = [sku];
  if (product.colorEn) parts.push(product.colorEn.slice(0, 3).toUpperCase());
  else if (product.color) {
    // تحويل اللون العربي لكود إنجليزي مختصر
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

export default function BarcodeLabel({ product, onClose }: BarcodeLabelProps) {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const currency = isAr ? "ر.س" : "SAR";
  const [copies, setCopies] = useState(1);
  const [labelSize, setLabelSize] = useState<"58mm" | "80mm">("58mm");
  const svgRef = useRef<SVGSVGElement>(null);

  const barcode = buildBarcode(product);
  const displayBarcode = barcode;

  useEffect(() => {
    if (svgRef.current) {
      try {
        JsBarcode(svgRef.current, barcode, {
          format: "CODE128",
          width: 1.5,
          height: 40,
          displayValue: true,
          fontSize: 10,
          margin: 4,
          background: "#ffffff",
          lineColor: "#000000",
        });
      } catch (e) {
        console.warn("JsBarcode error:", e);
      }
    }
  }, [barcode]);

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const labelWidth = labelSize === "58mm" ? "54mm" : "76mm";
    const productName = isAr ? product.name : (product.nameEn || product.name);
    const colorText = isAr ? product.color : (product.colorEn || product.color);

    const labelsHtml = Array.from({ length: copies }).map((_, i) => `
      <div class="label">
        <div class="store-name">DARIN MADANI</div>
        <div class="product-name">${productName}</div>
        ${(colorText || product.size) ? `<div class="detail">${[colorText, product.size].filter(Boolean).join(" · ")}</div>` : ""}
        <div class="price">${Number(product.salePrice).toLocaleString()} ${currency}</div>
        <svg id="bc${i}" class="barcode-svg"></svg>
        <div class="barcode-num">${displayBarcode}</div>
      </div>
    `).join("");

    const initScript = Array.from({ length: copies }).map((_, i) => `
      try { JsBarcode(document.getElementById('bc${i}'), '${barcode}', {format:'CODE128',width:1.2,height:28,displayValue:false,margin:2}); } catch(e){}
    `).join("\n");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="${isAr ? "rtl" : "ltr"}">
      <head>
        <meta charset="UTF-8">
        <title>Barcode Labels</title>
        <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js"><\/script>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Arial', sans-serif; background: white; }
          .labels-container { display: flex; flex-wrap: wrap; gap: 2mm; padding: 2mm; }
          .label {
            width: ${labelWidth};
            border: 0.5px solid #ccc;
            padding: 2mm 2mm 1mm;
            display: flex;
            flex-direction: column;
            align-items: center;
            page-break-inside: avoid;
          }
          .store-name { font-size: 6.5pt; font-weight: bold; letter-spacing: 1.5px; color: #8B7355; margin-bottom: 0.5mm; }
          .product-name { font-size: 8pt; font-weight: bold; text-align: center; margin-bottom: 0.5mm; line-height: 1.2; }
          .detail { font-size: 6.5pt; color: #555; margin-bottom: 0.5mm; }
          .price { font-size: 10pt; font-weight: bold; color: #8B7355; margin-bottom: 1mm; }
          .barcode-svg { width: 100%; max-height: 10mm; }
          .barcode-num { font-size: 5.5pt; color: #666; margin-top: 0.5mm; font-family: monospace; letter-spacing: 0.5px; }
          @media print {
            body { margin: 0; }
            .labels-container { gap: 1mm; padding: 1mm; }
          }
        </style>
      </head>
      <body>
        <div class="labels-container">${labelsHtml}</div>
        <script>
          window.onload = function() {
            ${initScript}
            setTimeout(function() { window.print(); window.close(); }, 600);
          };
        <\/script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{t("inventory.barcode")}</DialogTitle>
        </DialogHeader>

        {/* Preview */}
        <div className="border border-border rounded-lg p-4 bg-white flex flex-col items-center gap-1">
          <p className="text-[10px] font-bold tracking-widest text-amber-700">DARIN MADANI</p>
          <p className="text-sm font-bold text-gray-900 text-center">
            {isAr ? product.name : (product.nameEn || product.name)}
          </p>
          {(product.color || product.size) && (
            <p className="text-xs text-gray-500">
              {isAr ? product.color : (product.colorEn || product.color)}
              {product.size && ` · ${product.size}`}
            </p>
          )}
          <p className="text-base font-bold text-amber-700">
            {Number(product.salePrice).toLocaleString()} {currency}
          </p>
          <svg ref={svgRef} className="w-full max-h-14" />
          <p className="text-[10px] font-mono text-gray-500 mt-0.5">{displayBarcode}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label>{isAr ? "عدد النسخ" : "Copies"}</Label>
            <Input
              type="number"
              min="1"
              max="500"
              value={copies}
              onChange={e => setCopies(Math.max(1, parseInt(e.target.value) || 1))}
            />
          </div>
          <div className="space-y-1">
            <Label>{isAr ? "حجم الملصق" : "Label Size"}</Label>
            <Select value={labelSize} onValueChange={(v: any) => setLabelSize(v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="58mm">58mm</SelectItem>
                <SelectItem value="80mm">80mm</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>{t("common.cancel")}</Button>
          <Button onClick={handlePrint} className="gap-2">
            <Printer size={14} />
            {isAr ? `طباعة ${copies} نسخة` : `Print ${copies} copies`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
