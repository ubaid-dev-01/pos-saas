import { ScanLine } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "../../context/LocaleContext";
import useCartStore from "../../stores/cartStore";
import useProductStore from "../../stores/productStore";
import BarcodeScannerModal from "../ui/BarcodeScannerModal";

function normalizeBarcode(value) {
  return String(value || "")
    .replace(/\s+/g, "")
    .trim()
    .toLowerCase();
}

export default function BarcodeInput({ inputRef }) {
  const { t } = useTranslation();
  const { products } = useProductStore();
  const addItem = useCartStore((s) => s.addItem);
  const [val, setVal] = useState("");
  const [scanOpen, setScanOpen] = useState(false);
  const localRef = useRef(null);

  useEffect(() => {
    if (inputRef) return undefined;
    const timer = setTimeout(() => localRef.current?.focus(), 0);
    return () => clearTimeout(timer);
  }, [inputRef]);

  const setRefs = (el) => {
    localRef.current = el;
    if (inputRef) inputRef.current = el;
  };

  const addProductByBarcode = (code) => {
    const normalized = normalizeBarcode(code);
    if (!normalized) return;
    const p = products.find(
      (x) => normalizeBarcode(x.barcode) === normalized && x.isActive !== false,
    );
    if (!p) {
      toast.error(t("pos.barcode.notFound"));
      setVal("");
      return;
    }
    addItem(p, 1);
    toast.success(t("pos.barcode.added", { name: p.name }));
    setVal("");
  };

  const onSubmit = (e) => {
    e.preventDefault();
    addProductByBarcode(val);
  };

  return (
    <>
      <form onSubmit={onSubmit} className="flex gap-2">
        <input
          ref={setRefs}
          name="barcode"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          placeholder={t("pos.barcode.placeholder")}
          className="flex-1 rounded-xl border border-border px-3 py-2 text-sm bg-surface focus:outline-none focus:ring-2 focus:ring-accent/40"
        />
        <button
          type="button"
          className="shrink-0 p-2.5 rounded-xl bg-accent text-white hover:opacity-90"
          onClick={() => setScanOpen(true)}
          aria-label={t("pos.barcode.scanLabel")}
          title={t("pos.barcode.scanLabel")}
        >
          <ScanLine className="w-5 h-5" />
        </button>
      </form>

      <BarcodeScannerModal
        open={scanOpen}
        onClose={() => setScanOpen(false)}
        onDetected={(code) => {
          setVal(code);
          addProductByBarcode(code);
        }}
      />
    </>
  );
}
