import { doc, updateDoc } from "firebase/firestore";
import { Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { db } from "../../config/firebase";
import useAuthStore from "../../stores/authStore";
import useProductStore from "../../stores/productStore";
import ActionIconButton from "../ui/ActionIconButton";
import Modal from "../ui/Modal";
import SearchInput from "../ui/SearchInput";
import { useTranslation } from "../../context/LocaleContext";

export default function CategoryManager() {
  const { t } = useTranslation();
  const { store, refreshStore } = useAuthStore();
  const { products } = useProductStore();
  const [name, setName] = useState("");
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  const updateCategories = async (categories) => {
    if (!store?.id) return;
    await updateDoc(doc(db, "stores", store.id), { categories });
    await refreshStore();
  };

  const add = async () => {
    if (!name.trim()) return;
    try {
      const next = Array.from(
        new Set([...(store.categories || []), name.trim()]),
      );
      await updateCategories(next);
      setName("");
      toast.success(t("toast.saved"));
    } catch (e) {
      toast.error(e?.message || "Failed to update categories");
    }
  };

  const remove = async (cat) => {
    const used = products.some(
      (p) => p.category === cat && p.isActive !== false,
    );
    if (used) {
      toast.error(t("toast.categoryInUse"));
      return;
    }
    try {
      await updateCategories((store.categories || []).filter((c) => c !== cat));
      toast.success(t("toast.removed"));
    } catch (e) {
      toast.error(e?.message || "Failed to remove category");
    }
  };

  const filteredCategories = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return store?.categories || [];
    return (store?.categories || []).filter((c) =>
      c.toLowerCase().includes(term),
    );
  }, [q, store?.categories]);

  return (
    <div className="space-y-3 text-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-text-primary">
          Categories
        </h2>
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
        placeholder="Search categories..."
      />

      <Modal
        open={open}
        onClose={() => {
          setOpen(false);
          setName("");
        }}
        title="Add category"
      >
        <div className="space-y-3 text-sm">
          <input
            className="w-full rounded-xl border border-border px-3 py-2"
            placeholder="Category name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
          <button
            type="button"
            onClick={async () => {
              await add();
              if (name === "") setOpen(false);
            }}
            className="w-full px-4 py-2 rounded-xl bg-primary text-white font-semibold"
          >
            Add
          </button>
        </div>
      </Modal>

      <div className="rounded-2xl border border-border bg-surface overflow-hidden">
        {filteredCategories.length === 0 ? (
          <p className="p-4 text-text-muted text-center">No categories yet</p>
        ) : (
          <ul className="divide-y divide-border">
            {filteredCategories.map((c) => (
              <li
                key={c}
                className="flex items-center justify-between px-4 py-3 hover:bg-background transition"
              >
                <span className="font-medium text-text-primary">{c}</span>
                <ActionIconButton
                  title="Delete"
                  icon={Trash2}
                  tone="danger"
                  onClick={() => remove(c)}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
