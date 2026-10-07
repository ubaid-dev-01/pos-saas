import { useMemo, useRef, useState } from "react";
import useDebounce from "../../hooks/useDebounce";
import useCartStore from "../../stores/cartStore";
import useProductStore from "../../stores/productStore";
import SearchInput from "../ui/SearchInput";
import SearchableSelect from "../ui/SearchableSelect";
import BarcodeInput from "./BarcodeInput";
import ProductCard from "./ProductCard";
import { useTranslation } from "../../context/LocaleContext";

export default function ProductGrid({ searchRef, barcodeRef }) {
  const { t } = useTranslation();
  const { products, loading } = useProductStore();
  const addItem = useCartStore((s) => s.addItem);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [sort, setSort] = useState("name-asc");
  const [view, setView] = useState("grid");
  const dq = useDebounce(q, 300);
  const internalRef = useRef(null);
  const ref = searchRef || internalRef;

  const categories = useMemo(() => {
    const s = new Set();
    products.forEach((p) => p.category && s.add(p.category));
    return ["All", ...Array.from(s).sort()];
  }, [products]);

  const filtered = useMemo(() => {
    let list = products.filter((p) => p.isActive !== false);
    if (cat !== "All") list = list.filter((p) => p.category === cat);
    if (dq.trim()) {
      const t = dq.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.name?.toLowerCase().includes(t) ||
          p.sku?.toLowerCase().includes(t) ||
          p.barcode?.toLowerCase().includes(t),
      );
    }
    const arr = [...list];
    if (sort === "price-asc")
      arr.sort((a, b) => Number(a.price) - Number(b.price));
    else if (sort === "price-desc")
      arr.sort((a, b) => Number(b.price) - Number(a.price));
    else if (sort === "name-desc")
      arr.sort((a, b) => (b.name || "").localeCompare(a.name || ""));
    else arr.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    return arr;
  }, [products, cat, dq, sort]);

  return (
    <div className="space-y-4">
      <BarcodeInput inputRef={barcodeRef} />
      <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
        <div className="flex-1">
          <SearchInput
            inputRef={ref}
            value={q}
            onChange={setQ}
            placeholder={t("pos.searchProducts")}
          />
        </div>
        <SearchableSelect
          className="min-w-[190px]"
          value={sort}
          onChange={setSort}
          options={[
            { value: "name-asc", label: "Name A-Z" },
            { value: "name-desc", label: "Name Z-A" },
            { value: "price-asc", label: "Price low-high" },
            { value: "price-desc", label: "Price high-low" },
          ]}
          placeholder="Sort"
        />
        <div className="flex rounded-xl border border-border overflow-hidden text-sm">
          <button
            type="button"
            onClick={() => setView("grid")}
            className={`px-3 py-2 ${view === "grid" ? "bg-primary text-white" : "bg-surface"}`}
          >
            Grid
          </button>
          <button
            type="button"
            onClick={() => setView("list")}
            className={`px-3 py-2 ${view === "list" ? "bg-primary text-white" : "bg-surface"}`}
          >
            List
          </button>
        </div>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCat(c)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border ${
              cat === c
                ? "bg-primary text-white border-primary"
                : "bg-surface border-border text-text-muted"
            }`}
          >
            {c}
          </button>
        ))}
      </div>
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-40 rounded-2xl bg-border animate-pulse" />
          ))}
        </div>
      ) : (
        <div
          className={
            view === "grid"
              ? "grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3"
              : "flex flex-col gap-2"
          }
        >
          {filtered.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              list={view === "list"}
              onAdd={(pr) => addItem(pr, 1)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
