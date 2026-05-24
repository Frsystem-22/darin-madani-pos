import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

export default function BarcodeLabel({ product, onClose }: BarcodeLabelProps) {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const [copies, setCopies] = useState(1);
  const svgRef = useRef<SVGSVGElement>(null);

  // رقم الباركود من قاعدة البيانات مباشرة - جزء واحد فقط
  const barcode = String(product.barcode || product.id || "0000000000")
    .replace(/[^\x20-\x7E]/g, "")
    .trim() || "0000000000";

  useEffect(() => {
    if (svgRef.current) {
      try {
        JsBarcode(svgRef.current, barcode, {
          format: "CODE128",
          width: 3,
          height: 70,
          displayValue: false,
          margin: 6,
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

    const labelsHtml = Array.from({ length: copies }).map((_, i) => `
      <div class="label">
        <svg id="bc${i}" class="barcode-svg"></svg>
        <div class="barcode-num">${barcode}</div>
      </div>
    `).join("");

    const initScript = Array.from({ length: copies }).map((_, i) => `
      try { JsBarcode(document.getElementById('bc${i}'), '${barcode}', {format:'CODE128',width:2.8,height:55,displayValue:false,margin:4}); } catch(e){}
    `).join("\n");

    printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Barcode Labels</title>
  <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js"><\/script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; background: white; }
    .labels-container { display: flex; flex-wrap: wrap; gap: 2mm; padding: 2mm; }
    .label {
      width: 58mm;
      height: 38mm;
      border: 0.5px solid #ccc;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      page-break-inside: avoid;
      overflow: hidden;
    }
    .barcode-svg { width: 95%; }
    .barcode-num {
      font-size: 9pt;
      color: #222;
      margin-top: 2mm;
      font-family: monospace;
      letter-spacing: 1.5px;
      font-weight: bold;
    }
    @media print {
      body { margin: 0; }
      .labels-container { gap: 1mm; padding: 1mm; }
      @page { size: 60mm 40mm; margin: 0; }
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
</html>`);
    printWindow.document.close();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{t("inventory.barcode")}</DialogTitle>
        </DialogHeader>

        {/* معاينة - باركود فقط مع الرقم */}
        <div className="border border-border rounded-lg p-4 bg-white flex flex-col items-center gap-2">
          <svg ref={svgRef} className="w-full" style={{ minHeight: "80px" }} />
          <p className="text-[11px] font-mono text-gray-700 font-bold tracking-widest">{barcode}</p>
        </div>

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
