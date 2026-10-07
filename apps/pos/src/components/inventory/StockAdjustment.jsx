import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import useAuthStore from "../../stores/authStore";
import useProductStore from "../../stores/productStore";
import Modal from "../ui/Modal";
import SearchableSelect from "../ui/SearchableSelect";
import { useTranslation } from "../../context/LocaleContext";

export default function StockAdjustment({ open, onClose, product }) {
  const { t } = useTranslation();
  const { register, handleSubmit, reset, watch, setValue } = useForm({
    defaultValues: { type: "add", reason: "Restock" },
  });
  const { userDoc, user } = useAuthStore();
  const { adjustStock } = useProductStore();

  if (!product) return null;

  const onSubmit = async (data) => {
    if (!userDoc?.storeId) return;
    try {
      await adjustStock(
        userDoc.storeId,
        product.id,
        {
          type: data.type,
          quantity: Number(data.quantity),
          reason: data.reason,
          notes: data.notes,
        },
        user?.uid,
      );
      toast.success(t("toast.updated"));
      onClose?.();
      reset();
    } catch (e) {
      toast.error(e?.message || t("toast.failed"));
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`${t("inventory.adjust")} · ${product.name}`}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 text-sm">
        <p className="text-text-muted">
          Current stock:{" "}
          <span className="font-bold text-text-primary">{product.stock}</span>
        </p>
        <div>
          <label className="text-xs text-text-muted">Type</label>
          <input type="hidden" {...register("type", { required: true })} />
          <SearchableSelect
            className="mt-1"
            value={watch("type")}
            onChange={(value) =>
              setValue("type", value, { shouldValidate: true })
            }
            options={[
              { value: "add", label: "Add" },
              { value: "remove", label: "Remove" },
            ]}
            placeholder="Type"
          />
        </div>
        <div>
          <label className="text-xs text-text-muted">Quantity</label>
          <input
            type="number"
            className="mt-1 w-full rounded-xl border border-border px-3 py-2"
            {...register("quantity", { required: true, min: 1 })}
          />
        </div>
        <div>
          <label className="text-xs text-text-muted">Reason</label>
          <input type="hidden" {...register("reason", { required: true })} />
          <SearchableSelect
            className="mt-1"
            value={watch("reason")}
            onChange={(value) =>
              setValue("reason", value, { shouldValidate: true })
            }
            options={["Restock", "Damaged", "Return", "Correction", "Other"]}
            placeholder="Reason"
          />
        </div>
        <div>
          <label className="text-xs text-text-muted">Notes</label>
          <textarea
            rows={2}
            className="mt-1 w-full rounded-xl border border-border px-3 py-2"
            {...register("notes")}
          />
        </div>
        <button
          type="submit"
          className="w-full py-2.5 rounded-xl bg-primary text-white font-semibold"
        >
          Save
        </button>
      </form>
    </Modal>
  );
}
