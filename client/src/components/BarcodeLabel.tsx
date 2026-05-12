import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Printer, X } from "lucide-react";

interface BarcodeLabelProps {
  product: {
    id: number;
    name: string;
    nameEn?: string;
    barcode?: string;
    color?: string;
    colorEn?: string;
    size?: string;
    salePrice: string;
  };
  onClose: () => void;
}

declare const JsBarcode: any;

export default function BarcodeLabel({ product, onClose }: BarcodeLabelProps) {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const currency = isAr ? "ر.س" : "SAR";
  const [copies, setCopies] = useState(1);
  const [labelSize, setLabelSize] = useState<"58mm" | "80mm">("58mm");
  const svgRef = useRef<SVGSVGElement>(null);

  const barcode = product.barcode || String(product.id).padStart(12, "0");

  useEffect(() => {
    if (svgRef.current && barcode) {
      try {
        // Dynamically load JsBarcode if not available
        if (typeof JsBarcode !== "undefined") {
          JsBarcode(svgRef.current, barcode, {
            format: "CODE128",
            width: 1.5,
            height: 40,
            displayValue: true,
            fontSize: 10,
            margin: 4,
          });
        }
      } catch (e) {
        console.warn("JsBarcode not loaded:", e);
      }
    }
  }, [barcode]);

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const labelWidth = labelSize === "58mm" ? "54mm" : "76mm";
    const labelsHtml = Array.from({ length: copies }).map(() => `
      <div class="label">
        <div class="store-name">DARIN MADANI</div>
        <div class="product-name">${isAr ? product.name : (product.nameEn || product.name)}</div>
        ${product.color ? `<div class="detail">${isAr ? product.color : (product.colorEn || product.color)}${product.size ? ` · ${product.size}` : ""}</div>` : ""}
        <div class="price">${Number(product.salePrice).toLocaleString()} ${currency}</div>
        <svg id="barcode-${Math.random()}" class="barcode-svg"></svg>
        <div class="barcode-num">${barcode}</div>
      </div>
    `).join("");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="${isAr ? "rtl" : "ltr"}">
      <head>
        <meta charset="UTF-8">
        <title>Barcode Labels</title>
        <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js"></script>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Arial', sans-serif; background: white; }
          .labels-container { display: flex; flex-wrap: wrap; gap: 2mm; padding: 2mm; }
          .label {
            width: ${labelWidth};
            border: 0.5px solid #ccc;
            padding: 2mm;
            display: flex;
            flex-direction: column;
            align-items: center;
            page-break-inside: avoid;
          }
          .store-name { font-size: 7pt; font-weight: bold; letter-spacing: 1px; color: #8B7355; margin-bottom: 1mm; }
          .product-name { font-size: 8pt; font-weight: bold; text-align: center; margin-bottom: 0.5mm; }
          .detail { font-size: 7pt; color: #555; margin-bottom: 0.5mm; }
          .price { font-size: 10pt; font-weight: bold; color: #8B7355; margin-bottom: 1mm; }
          .barcode-svg { width: 100%; max-height: 12mm; }
          .barcode-num { font-size: 6pt; color: #666; margin-top: 0.5mm; font-family: monospace; }
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
            document.querySelectorAll('.barcode-svg').forEach(function(svg) {
              try {
                JsBarcode(svg, '${barcode}', {
                  format: 'CODE128',
                  width: 1.2,
                  height: 30,
                  displayValue: false,
                  margin: 2,
                });
              } catch(e) {}
            });
            setTimeout(function() { window.print(); window.close(); }, 500);
          };
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {t("inventory.barcode")}
          </DialogTitle>
        </DialogHeader>

        {/* Preview */}
        <div className="border border-border rounded-lg p-4 bg-white dark:bg-white flex flex-col items-center gap-1">
          <p className="text-xs font-bold tracking-widest text-amber-700">DARIN MADANI</p>
          <p className="text-sm font-bold text-gray-900 text-center">{isAr ? product.name : (product.nameEn || product.name)}</p>
          {(product.color || product.size) && (
            <p className="text-xs text-gray-500">
              {isAr ? product.color : product.colorEn}
              {product.size && ` · ${product.size}`}
            </p>
          )}
          <p className="text-base font-bold text-amber-700">{Number(product.salePrice).toLocaleString()} {currency}</p>
          <svg ref={svgRef} className="w-full max-h-12" />
          {typeof JsBarcode === "undefined" && (
            <p className="text-xs font-mono text-gray-600">{barcode}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label>{isAr ? "عدد النسخ" : "Copies"}</Label>
            <Input type="number" min="1" max="100" value={copies} onChange={e => setCopies(parseInt(e.target.value) || 1)} />
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
