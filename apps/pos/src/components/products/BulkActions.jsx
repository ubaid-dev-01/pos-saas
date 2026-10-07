import { useState } from "react";
import toast from "react-hot-toast";
import useAuthStore from "../../stores/authStore";
import useProductStore from "../../stores/productStore";
import Modal from "../ui/Modal";
import SearchableSelect from "../ui/SearchableSelect";
import { useTranslation } from "../../context/LocaleContext";

export default function BulkActions({ selected, onClear }) {
  const { t } = useTranslation();
  const { userDoc, store } = useAuthStore();
  const { bulkDelete, bulkPriceUpdate } = useProductStore();
  const [priceOpen, setPriceOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [pct, setPct] = useState("5");
  const [cat, setCat] = useState(store?.categories?.[0] || "");
  const [busy, setBusy] = useState(false);

  if (!selected.length) return null;

  const runDelete = async () => {
    if (!userDoc?.storeId) return;
    setBusy(true);
    try {
      await bulkDelete(userDoc.storeId, selected);
      toast.success(t("toast.productsArchived"));
      onClear();
    } catch (e) {
      toast.error(e?.message || "Bulk delete failed");
    } finally {
      setBusy(false);
    }
  };

  const runPrice = async (type) => {
    if (!userDoc?.storeId) return;
    setBusy(true);
    try {
      await bulkPriceUpdate(userDoc.storeId, selected, type, Number(pct) || 0);
      toast.success(t("toast.pricesUpdated"));
      setPriceOpen(false);
      onClear();
    } catch (e) {
      toast.error(e?.message || "Bulk update failed");
    } finally {
      setBusy(false);
    }
  };

  const runCategory = async () => {
    if (!userDoc?.storeId) return;
    setBusy(true);
    try {
      const { writeBatch, doc } = await import("firebase/firestore");
      const { db } = await import("../../config/firebase");
      const batch = writeBatch(db);
      selected.forEach((id) => {
        batch.update(doc(db, "stores", userDoc.storeId, "products", id), {
          category: cat,
          updatedAt: new Date().toISOString(),
        });
      });
      await batch.commit();
      toast.success(t("toast.categoriesUpdated"));
      setCatOpen(false);
      onClear();
    } catch (e) {
      toast.error(e?.message || "Bulk category failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-wrap gap-2 items-center mb-3 p-3 rounded-xl border border-secondary/40 bg-secondary/10">
      <span className="text-sm font-semibold text-text-primary">
        {selected.length} selected
      </span>
      <button
        type="button"
        className="px-3 py-1.5 rounded-lg bg-white border text-xs font-semibold"
        onClick={() => setPriceOpen(true)}
      >
        Bulk price
      </button>
      <button
        type="button"
        className="px-3 py-1.5 rounded-lg bg-white border text-xs font-semibold"
        onClick={() => setCatOpen(true)}
      >
        Bulk category
      </button>
      <button
        type="button"
        className="px-3 py-1.5 rounded-lg bg-error text-white text-xs font-semibold"
        onClick={runDelete}
        disabled={busy}
      >
        Archive
      </button>
      <button
        type="button"
        className="text-xs text-text-muted underline"
        onClick={() => onClear()}
      >
        Clear selection
      </button>

      <Modal
        open={priceOpen}
        onClose={() => setPriceOpen(false)}
        title="Bulk price update"
      >
        <div className="space-y-3 text-sm">
          <input
            type="number"
            className="w-full rounded-xl border border-border px-3 py-2"
            value={pct}
            onChange={(e) => setPct(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={busy}
              className="py-2 rounded-xl bg-primary text-white text-xs font-semibold"
              onClick={() => runPrice("increase_pct")}
            >
              + %
            </button>
            <button
              type="button"
              disabled={busy}
              className="py-2 rounded-xl border text-xs font-semibold"
              onClick={() => runPrice("decrease_pct")}
            >
              − %
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        open={catOpen}
        onClose={() => setCatOpen(false)}
        title="Bulk category"
      >
        <SearchableSelect
          className="w-full mb-3"
          value={cat}
          onChange={setCat}
          options={(store?.categories || []).map((c) => ({
            value: c,
            label: c,
          }))}
          placeholder="Category"
        />
        <button
          type="button"
          disabled={busy}
          onClick={runCategory}
          className="w-full py-2 rounded-xl bg-primary text-white text-sm font-semibold"
        >
          Apply
        </button>
      </Modal>
    </div>
  );
}
