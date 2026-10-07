import {
    LayoutGrid,
    List,
    Pencil,
    Plus,
    RotateCcw,
    Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import useAuthStore from "../../stores/authStore";
import useSupplierStore from "../../stores/supplierStore";
import ActionIconButton from "../ui/ActionIconButton";
import ConfirmDialog from "../ui/ConfirmDialog";
import Modal from "../ui/Modal";
import SearchInput from "../ui/SearchInput";
import { useTranslation } from "../../context/LocaleContext";

const emptyValues = {
  name: "",
  contactNumber: "",
  email: "",
  location: "",
  address: "",
  notes: "",
};

export default function SupplierManager() {
  const { t } = useTranslation();
  const { userDoc } = useAuthStore();
  const {
    suppliers,
    loading,
    subscribeSuppliers,
    cleanup,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    setSupplierActive,
  } = useSupplierStore();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: emptyValues });
  const [editing, setEditing] = useState(null);
  const [q, setQ] = useState("");
  const [view, setView] = useState("table");
  const [open, setOpen] = useState(false);
  const [showInactive, setShowInactive] = useState(false);
  const [del, setDel] = useState(null);
  const [hardDel, setHardDel] = useState(null);

  useEffect(() => {
    if (!userDoc?.storeId) return undefined;
    subscribeSuppliers(userDoc.storeId);
    return () => cleanup();
  }, [userDoc?.storeId, subscribeSuppliers, cleanup]);

  const onSubmit = async (data) => {
    if (!userDoc?.storeId) return;
    try {
      if (editing?.id) {
        await updateSupplier(userDoc.storeId, editing.id, data);
        toast.success(t("toast.supplierUpdated"));
      } else {
        await addSupplier(userDoc.storeId, data);
        toast.success(t("toast.supplierAdded"));
      }
      setEditing(null);
      reset(emptyValues);
    } catch (e) {
      toast.error(e?.message || "Failed to save supplier");
    }
  };

  const startEdit = (s) => {
    setEditing(s);
    setOpen(true);
    reset({
      name: s.name || "",
      contactNumber: s.contactNumber || "",
      email: s.email || "",
      location: s.location || "",
      address: s.address || "",
      notes: s.notes || "",
    });
  };

  const startAdd = () => {
    setEditing(null);
    reset(emptyValues);
    setOpen(true);
  };

  const archive = async (id) => {
    if (!userDoc?.storeId) return;
    try {
      await deleteSupplier(userDoc.storeId, id, true);
      toast.success(t("toast.supplierArchived"));
      if (editing?.id === id) {
        setEditing(null);
        reset(emptyValues);
      }
    } catch (e) {
      toast.error(e?.message || "Failed to remove supplier");
    }
  };

  const filteredSuppliers = useMemo(() => {
    const term = q.trim().toLowerCase();
    return (suppliers || [])
      .filter((s) => (showInactive ? true : s.isActive !== false))
      .filter((s) => {
        if (!term) return true;
        return (
          s.name?.toLowerCase().includes(term) ||
          s.contactNumber?.toLowerCase().includes(term) ||
          s.email?.toLowerCase().includes(term) ||
          s.location?.toLowerCase().includes(term)
        );
      });
  }, [suppliers, q, showInactive]);

  return (
    <div className="space-y-4 text-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-text-primary">Suppliers</p>
          <p className="text-xs text-text-muted">
            Manage supplier records in a modal form.
          </p>
        </div>
        <button
          type="button"
          onClick={startAdd}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-primary text-white text-sm font-semibold"
        >
          <Plus className="w-4 h-4" /> Add supplier
        </button>
      </div>

      <Modal
        open={open}
        onClose={() => {
          setOpen(false);
          setEditing(null);
          reset(emptyValues);
        }}
        title={editing ? "Edit supplier" : "Add supplier"}
        wide
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-text-muted">Supplier name *</label>
              <input
                className="mt-1 w-full rounded-xl border border-border px-3 py-2"
                {...register("name", { required: "Supplier name is required" })}
              />
              {errors.name && (
                <p className="text-error text-xs mt-1">{errors.name.message}</p>
              )}
            </div>
            <div>
              <label className="text-xs text-text-muted">Contact number</label>
              <input
                className="mt-1 w-full rounded-xl border border-border px-3 py-2"
                {...register("contactNumber")}
              />
            </div>
            <div>
              <label className="text-xs text-text-muted">Email</label>
              <input
                type="email"
                className="mt-1 w-full rounded-xl border border-border px-3 py-2"
                {...register("email")}
              />
            </div>
            <div>
              <label className="text-xs text-text-muted">Location</label>
              <input
                className="mt-1 w-full rounded-xl border border-border px-3 py-2"
                {...register("location")}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs text-text-muted">Address</label>
              <input
                className="mt-1 w-full rounded-xl border border-border px-3 py-2"
                {...register("address")}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs text-text-muted">Notes</label>
              <textarea
                rows={2}
                className="mt-1 w-full rounded-xl border border-border px-3 py-2"
                {...register("notes")}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-primary text-white font-semibold"
            >
              {editing ? "Update supplier" : "Save supplier"}
            </button>
            {editing && (
              <button
                type="button"
                className="px-4 py-2 rounded-xl border border-border"
                onClick={() => {
                  setEditing(null);
                  reset(emptyValues);
                  setOpen(false);
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </Modal>

      <div className="flex flex-col lg:flex-row gap-2 lg:items-center lg:justify-between">
        <div className="flex-1">
          <SearchInput
            value={q}
            onChange={setQ}
            placeholder="Search suppliers by name, contact, email..."
          />
        </div>
        <button
          type="button"
          onClick={() => setShowInactive((prev) => !prev)}
          className="px-3 py-2 rounded-xl border border-border bg-surface text-sm font-medium"
        >
          {showInactive ? "Hide inactive" : "Show inactive"}
        </button>
        <div className="inline-flex rounded-xl border border-border overflow-hidden bg-surface">
          <button
            type="button"
            onClick={() => setView("table")}
            className={`px-3 py-2 ${view === "table" ? "bg-primary text-white" : "text-text-muted hover:bg-background"}`}
            title="Table view"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setView("grid")}
            className={`px-3 py-2 ${view === "grid" ? "bg-primary text-white" : "text-text-muted hover:bg-background"}`}
            title="Grid view"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      </div>

      {view === "table" ? (
        <div className="rounded-2xl border border-border bg-surface overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-background text-xs text-text-muted uppercase">
              <tr>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Contact</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Location</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSuppliers.map((s) => (
                <tr key={s.id} className="border-t border-border/60">
                  <td className="p-3 font-medium">
                    {s.name}
                    {showInactive && s.isActive === false && (
                      <span className="ml-2 inline-flex px-2 py-0.5 rounded-full text-[10px] bg-rose-100 text-rose-700">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-text-muted">
                    {s.contactNumber || "-"}
                  </td>
                  <td className="p-3 text-text-muted">{s.email || "-"}</td>
                  <td className="p-3 text-text-muted">{s.location || "-"}</td>
                  <td className="p-3 text-right space-x-1">
                    <ActionIconButton
                      title="Edit"
                      icon={Pencil}
                      tone="warning"
                      disabled={s.isActive === false}
                      onClick={() => s.isActive !== false && startEdit(s)}
                    />
                    {s.isActive === false ? (
                      <>
                        <ActionIconButton
                          title="Restore"
                          icon={RotateCcw}
                          tone="success"
                          onClick={async () => {
                            try {
                              await setSupplierActive(
                                userDoc.storeId,
                                s.id,
                                true,
                              );
                              toast.success(t("toast.supplierActivated"));
                            } catch (e) {
                              toast.error(e?.message || "Failed");
                            }
                          }}
                        />
                        <ActionIconButton
                          title="Delete permanently"
                          icon={Trash2}
                          tone="danger"
                          onClick={() => setHardDel(s)}
                        />
                      </>
                    ) : (
                      <ActionIconButton
                        title="Archive"
                        icon={Trash2}
                        tone="danger"
                        onClick={() => setDel(s)}
                      />
                    )}
                  </td>
                </tr>
              ))}
              {!loading && !filteredSuppliers.length && (
                <tr>
                  <td className="p-4 text-text-muted" colSpan={5}>
                    No suppliers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {filteredSuppliers.map((s) => (
            <div
              key={s.id}
              className="rounded-2xl border border-border bg-surface p-4 space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-text-primary">{s.name}</p>
                  {showInactive && s.isActive === false && (
                    <p className="mt-1 inline-flex px-2 py-0.5 rounded-full text-[10px] bg-rose-100 text-rose-700">
                      Inactive
                    </p>
                  )}
                  <p className="text-xs text-text-muted">
                    {s.location || "Unknown location"}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <ActionIconButton
                    title="Edit"
                    icon={Pencil}
                    tone="warning"
                    disabled={s.isActive === false}
                    onClick={() => s.isActive !== false && startEdit(s)}
                  />
                  {s.isActive === false ? (
                    <>
                      <ActionIconButton
                        title="Restore"
                        icon={RotateCcw}
                        tone="success"
                        onClick={async () => {
                          try {
                            await setSupplierActive(
                              userDoc.storeId,
                              s.id,
                              true,
                            );
                            toast.success(t("toast.supplierActivated"));
                          } catch (e) {
                            toast.error(e?.message || "Failed");
                          }
                        }}
                      />
                      <ActionIconButton
                        title="Delete permanently"
                        icon={Trash2}
                        tone="danger"
                        onClick={() => setHardDel(s)}
                      />
                    </>
                  ) : (
                    <ActionIconButton
                      title="Archive"
                      icon={Trash2}
                      tone="danger"
                      onClick={() => setDel(s)}
                    />
                  )}
                </div>
              </div>
              <p className="text-xs text-text-muted">
                Contact: {s.contactNumber || "-"}
              </p>
              <p className="text-xs text-text-muted">Email: {s.email || "-"}</p>
            </div>
          ))}
          {!loading && !filteredSuppliers.length && (
            <div className="rounded-2xl border border-border bg-surface p-4 text-sm text-text-muted">
              No suppliers found.
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        open={!!del}
        onClose={() => setDel(null)}
        title="Archive supplier?"
        message="Supplier inactive ho jayega, baad mein restore kar sakte hain."
        confirmLabel="Archive"
        danger
        onConfirm={async () => {
          await archive(del.id);
          setDel(null);
        }}
      />

      <ConfirmDialog
        open={!!hardDel}
        onClose={() => setHardDel(null)}
        title="Delete supplier permanently?"
        message="Ye action undo nahi hoga."
        confirmLabel="Delete permanently"
        danger
        onConfirm={async () => {
          try {
            await deleteSupplier(userDoc.storeId, hardDel.id, false);
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
