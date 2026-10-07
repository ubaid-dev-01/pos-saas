import {
    Download,
    Eye,
    EyeOff,
    LayoutGrid,
    List,
    Plus,
    Upload,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import BulkActions from "../components/products/BulkActions";
import ProductCatalogCard from "../components/products/ProductCatalogCard";
import ProductForm from "../components/products/ProductForm";
import ProductTable from "../components/products/ProductTable";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import EmptyState from "../components/ui/EmptyState";
import Modal from "../components/ui/Modal";
import SearchableSelect from "../components/ui/SearchableSelect";
import SearchInput from "../components/ui/SearchInput";
import useDebounce from "../hooks/useDebounce";
import useAuthStore from "../stores/authStore";
import useProductStore from "../stores/productStore";
import { parseCsv, stringifyCsv } from "../utils/csv";
import { formatCurrency } from "../utils/format";
import { useTranslation } from "../context/LocaleContext";

const CSV_HEADERS = [
  "id",
  "sku",
  "barcode",
  "name",
  "category",
  "description",
  "price",
  "costPrice",
  "wholesalePrice",
  "stock",
  "lowStockThreshold",
  "expiryDate",
  "expiryWarningDays",
  "taxRate",
  "unit",
  "batchNumber",
  "lastRestockDate",
  "storageLocation",
  "supplierId",
  "supplierName",
  "supplierContact",
  "supplierEmail",
  "supplierLocation",
  "isActive",
];

function download(filename, text, mime) {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export default function ProductsPage() {
  const { t } = useTranslation();
  const {
    products,
    loading,
    deleteProduct,
    setProductActive,
    bulkImportProducts,
  } = useProductStore();
  const { userDoc } = useAuthStore();
  const [q, setQ] = useState("");
  const dq = useDebounce(q, 300);
  const [cat, setCat] = useState("All");
  const [sort, setSort] = useState("name-asc");
  const [view, setView] = useState("table");
  const [showInactive, setShowInactive] = useState(false);
  const [selected, setSelected] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [edit, setEdit] = useState(null);
  const [del, setDel] = useState(null);
  const [hardDel, setHardDel] = useState(null);
  const [viewP, setViewP] = useState(null);
  const importRef = useRef(null);

  const categories = useMemo(() => {
    const s = new Set();
    products.forEach((p) => p.category && s.add(p.category));
    return ["All", ...Array.from(s).sort()];
  }, [products]);

  const filtered = useMemo(() => {
    let list = products.filter((p) =>
      showInactive ? true : p.isActive !== false,
    );
    if (cat !== "All") list = list.filter((p) => p.category === cat);
    if (dq.trim()) {
      const t = dq.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.name?.toLowerCase().includes(t) || p.sku?.toLowerCase().includes(t),
      );
    }
    return list;
  }, [products, cat, dq, showInactive]);

  const exportRows = useMemo(
    () =>
      filtered.map((p) => [
        p.id || "",
        p.sku || "",
        p.barcode || "",
        p.name || "",
        p.category || "",
        p.description || "",
        p.price ?? "",
        p.costPrice ?? "",
        p.wholesalePrice ?? "",
        p.stock ?? "",
        p.lowStockThreshold ?? "",
        p.expiryDate || "",
        p.expiryWarningDays ?? "",
        p.taxRate ?? "",
        p.unit || "",
        p.batchNumber || "",
        p.lastRestockDate || "",
        p.storageLocation || "",
        p.supplierId || "",
        p.supplierName || "",
        p.supplierContact || "",
        p.supplierEmail || "",
        p.supplierLocation || "",
        p.isActive === false ? "false" : "true",
      ]),
    [filtered],
  );

  const handleExport = () => {
    const csv = stringifyCsv(CSV_HEADERS, exportRows);
    download("products-export.csv", csv, "text/csv");
    toast.success(t("toast.csvDownloaded"));
  };

  const handleImport = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !userDoc?.storeId) return;

    try {
      const text = await file.text();
      const rows = parseCsv(text);
      if (rows.length < 2) {
        toast.error(t("toast.csvEmpty"));
        return;
      }

      const [headerRow, ...dataRows] = rows;
      const records = dataRows
        .map((row) =>
          headerRow.reduce((acc, header, index) => {
            acc[String(header || "").trim()] = row[index] ?? "";
            return acc;
          }, {}),
        )
        .filter((record) => String(record.name || "").trim());

      if (!records.length) {
        toast.error(t("toast.csvNoValidRows"));
        return;
      }

      await bulkImportProducts(userDoc.storeId, records);
      toast.success(
        `${records.length} product${records.length === 1 ? "" : "s"} imported`,
      );
    } catch (error) {
      toast.error(error?.message || "Import failed");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold text-text-primary">{t("products.title")}</h1>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => importRef.current?.click()}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-border bg-surface text-sm font-semibold"
          >
            <Upload className="w-4 h-4" /> {t("products.import")}
          </button>
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-border bg-surface text-sm font-semibold"
          >
            <Download className="w-4 h-4" /> {t("products.export")}
          </button>
          <button
            type="button"
            onClick={() => {
              setEdit(null);
              setFormOpen(true);
            }}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold"
          >
            <Plus className="w-4 h-4" /> {t("products.add")}
          </button>
          <input
            ref={importRef}
            type="file"
            accept=".csv,text/csv"
            hidden
            onChange={handleImport}
          />
        </div>
      </div>
      <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
        <div className="flex-1">
          <SearchInput
            value={q}
            onChange={setQ}
            placeholder={t("pos.searchProducts")}
          />
        </div>
        <SearchableSelect
          className="min-w-[180px]"
          value={cat}
          onChange={setCat}
          options={categories.map((c) => ({ value: c, label: c }))}
          placeholder="Category"
        />
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
        <button
          type="button"
          onClick={() => setShowInactive((prev) => !prev)}
          className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-border bg-surface text-sm font-medium"
        >
          {showInactive ? (
            <>
              <EyeOff className="w-4 h-4" /> {t("products.hideInactive")}
            </>
          ) : (
            <>
              <Eye className="w-4 h-4" /> {t("products.showInactive")}
            </>
          )}
        </button>
        <div className="flex rounded-xl border border-border overflow-hidden text-sm">
          <button
            type="button"
            onClick={() => setView("table")}
            className={`px-3 py-2 ${view === "table" ? "bg-primary text-white" : ""}`}
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setView("grid")}
            className={`px-3 py-2 ${view === "grid" ? "bg-primary text-white" : ""}`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      </div>

      <BulkActions selected={selected} onClear={() => setSelected([])} />

      {loading ? (
        <div className="h-40 rounded-2xl bg-border animate-pulse" />
      ) : !filtered.length ? (
        <EmptyState
          title={t("products.empty")}
          description={t("pos.addProductsHint")}
        />
      ) : view === "table" ? (
        <ProductTable
          products={filtered}
          showInactive={showInactive}
          selected={selected}
          onSelect={setSelected}
          sort={sort}
          onSort={(key) =>
            setSort((prev) => `${key}-${prev.endsWith("asc") ? "desc" : "asc"}`)
          }
          onEdit={(p) => {
            setEdit(p);
            setFormOpen(true);
          }}
          onDelete={(p) => setDel(p)}
          onRestore={async (p) => {
            try {
              await setProductActive(userDoc.storeId, p.id, true);
              toast.success(t("toast.productActivated"));
            } catch (e) {
              toast.error(e?.message || "Failed");
            }
          }}
          onHardDelete={(p) => setHardDel(p)}
          onView={(p) => setViewP(p)}
        />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
          {filtered.map((p) => (
            <ProductCatalogCard
              key={p.id}
              product={p}
              onEdit={(product) => {
                setEdit(product);
                setFormOpen(true);
              }}
              onArchive={(product) => setDel(product)}
              onRestore={async (product) => {
                try {
                  await setProductActive(userDoc.storeId, product.id, true);
                  toast.success(t("toast.productActivated"));
                } catch (e) {
                  toast.error(e?.message || "Failed");
                }
              }}
              onHardDelete={(product) => setHardDel(product)}
            />
          ))}
        </div>
      )}

      <ProductForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        product={edit}
      />

      <Modal
        open={!!viewP}
        onClose={() => setViewP(null)}
        title={viewP?.name || "Product"}
      >
        {viewP && (
          <div className="text-sm space-y-2 text-text-muted">
            {viewP?.images?.[0] && (
              <img
                src={viewP.images[0]}
                alt={viewP.name || "Product image"}
                className="w-28 h-28 rounded-xl object-cover border border-border"
              />
            )}
            <p>
              SKU:{" "}
              <span className="text-text-primary font-medium">{viewP.sku}</span>
            </p>
            <p>
              Price:{" "}
              <span className="text-text-primary font-medium">
                {formatCurrency(viewP.price)}
              </span>
            </p>
            <p>
              Stock:{" "}
              <span className="text-text-primary font-medium">
                {viewP.stock}
              </span>
            </p>
            <p>{viewP.description}</p>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!del}
        onClose={() => setDel(null)}
        title="Archive product?"
        message="This will hide the product from the POS catalog."
        danger
        onConfirm={async () => {
          try {
            await deleteProduct(userDoc.storeId, del.id, true);
            toast.success(t("toast.archived"));
          } catch (e) {
            toast.error(e?.message || "Failed");
          }
          setDel(null);
        }}
      />

      <ConfirmDialog
        open={!!hardDel}
        onClose={() => setHardDel(null)}
        title="Delete permanently?"
        message="This will permanently remove the product and cannot be undone."
        confirmLabel="Delete permanently"
        danger
        onConfirm={async () => {
          try {
            await deleteProduct(userDoc.storeId, hardDel.id, false);
            toast.success(t("toast.deletedPermanently"));
          } catch (e) {
            toast.error(e?.message || "Failed");
          }
          setHardDel(null);
        }}
      />
    </div>
  );
}
