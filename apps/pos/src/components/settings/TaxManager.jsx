import { doc, updateDoc } from "firebase/firestore";
import { Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { v4 as uuidv4 } from "uuid";
import { db } from "../../config/firebase";
import useAuthStore from "../../stores/authStore";
import ActionIconButton from "../ui/ActionIconButton";
import Modal from "../ui/Modal";
import SearchInput from "../ui/SearchInput";
import { useTranslation } from "../../context/LocaleContext";

export default function TaxManager() {
  const { t } = useTranslation();
  const { store, refreshStore } = useAuthStore();
  const [name, setName] = useState("");
  const [rate, setRate] = useState("");
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  const saveRates = async (taxRates) => {
    if (!store?.id) return;
    await updateDoc(doc(db, "stores", store.id), { taxRates });
    await refreshStore();
  };

  const add = async () => {
    if (!name.trim() || rate === "") return;
    try {
      const next = [
        ...(store.taxRates || []),
        { id: `tax-${uuidv4()}`, name: name.trim(), rate: Number(rate) },
      ];
      await saveRates(next);
      setName("");
      setRate("");
      toast.success(t("toast.saved"));
    } catch (e) {
      toast.error(e?.message || t("toast.failed"));
    }
  };

  const remove = async (id) => {
    try {
      const next = (store.taxRates || []).filter((tax) => tax.id !== id);
      await saveRates(next);
      toast.success(t("toast.deleted"));
    } catch (e) {
      toast.error(e?.message || t("toast.failed"));
    }
  };

  const filteredRates = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return store?.taxRates || [];
    return (store?.taxRates || []).filter((tax) => {
      return (
        tax.name?.toLowerCase().includes(term) ||
        String(tax.rate).includes(term)
      );
    });
  }, [q, store?.taxRates]);

  return (
    <div className="space-y-3 text-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-text-primary">Tax rates</h2>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-primary text-white text-sm font-semibold"
        >
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>

      <SearchInput
        value={q}
        onChange={setQ}
        placeholder="Search tax rates..."
      />

      <Modal
        open={open}
        onClose={() => {
          setOpen(false);
          setName("");
          setRate("");
        }}
        title="Add tax rate"
      >
        <div className="space-y-3">
          <div>
            <label className="text-xs text-text-muted">Name</label>
            <input
              className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm"
              placeholder="e.g., GST, VAT"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>
          <div>
            <label className="text-xs text-text-muted">Rate (%)</label>
            <input
              type="number"
              className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm"
              placeholder="5"
              step="0.01"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
            />
          </div>
          <button
            type="button"
            onClick={async () => {
              await add();
              if (name === "" || rate === "") return;
              setOpen(false);
            }}
            className="w-full px-4 py-2 rounded-xl bg-primary text-white font-semibold"
          >
            Add rate
          </button>
        </div>
      </Modal>

      <div className="rounded-2xl border border-border bg-surface overflow-hidden">
        {filteredRates.length === 0 ? (
          <p className="p-4 text-text-muted text-center">No tax rates yet</p>
        ) : (
          <ul className="divide-y divide-border">
            {filteredRates.map((t) => (
              <li
                key={t.id}
                className="flex items-center justify-between px-4 py-3 hover:bg-background transition"
              >
                <div className="space-y-1">
                  <p className="font-medium text-text-primary">{t.name}</p>
                  <p className="text-xs text-text-muted">{t.rate}%</p>
                </div>
                <ActionIconButton
                  title="Delete"
                  icon={Trash2}
                  tone="danger"
                  onClick={() => remove(t.id)}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
