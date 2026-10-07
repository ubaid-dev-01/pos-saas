import { useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import {
    SUPPORTED_CURRENCIES,
    getCurrencyMeta,
    getCurrencySymbol,
} from "../../constants/currencies";
import useAuthStore from "../../stores/authStore";
import { uploadImageToCloudinary } from "../../utils/cloudinary";
import ImageUploadButton from "../ui/ImageUploadButton";
import SearchableSelect from "../ui/SearchableSelect";
import { useTranslation } from "../../context/LocaleContext";

export default function StoreSettings() {
  const { t } = useTranslation();
  const { store, updateStore } = useAuthStore();
  const { register, handleSubmit, reset, setValue, watch } = useForm();

  useEffect(() => {
    if (store) {
      reset({
        name: store.name,
        address: store.address,
        phone: store.phone,
        email: store.email,
        gstNumber: store.gstNumber,
        currency: store.currency || "PKR",
        enableCreditSale: store.posConfig?.enableCreditSale !== false,
        fbrEnabled: store.fbrConfig?.enabled === true,
        fbrNtn: store.fbrConfig?.ntn || "",
        fbrPosId: store.fbrConfig?.posId || "",
        fbrTier1: store.fbrConfig?.tier1 === true,
      });
    }
  }, [store, reset]);

  const onSubmit = async (data) => {
    try {
      await updateStore({
        name: data.name,
        address: data.address,
        phone: data.phone,
        email: data.email,
        gstNumber: data.gstNumber,
        currency: data.currency,
        currencyLocale: getCurrencyMeta(data.currency).locale,
        posConfig: {
          ...(store?.posConfig || {}),
          enableCreditSale: data.enableCreditSale !== false,
        },
        fbrConfig: {
          enabled: data.fbrEnabled === true,
          ntn: (data.fbrNtn || "").trim(),
          posId: (data.fbrPosId || "").trim(),
          tier1: data.fbrTier1 === true,
        },
      });
      toast.success(t("settings.saved"));
    } catch (e) {
      toast.error(e?.message || t("toast.failed"));
    }
  };

  const onLogo = async (file) => {
    if (!file || !store?.id) return;
    try {
      const url = await uploadImageToCloudinary(file, {
        folder: `quickpos/stores/${store.id}/logo`,
      });
      await updateStore({ logo: url });
      toast.success(t("toast.logoUpdated"));
    } catch (err) {
      toast.error(err?.message || "Upload failed");
    }
  };

  if (!store) return null;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-3 w-full max-w-3xl text-sm"
    >
      <div>
        <label className="text-xs text-text-muted">Store name</label>
        <input
          className="mt-1 w-full rounded-xl border border-border px-3 py-2"
          {...register("name", { required: true })}
        />
      </div>
      <div>
        <label className="text-xs text-text-muted">Address</label>
        <textarea
          rows={2}
          className="mt-1 w-full rounded-xl border border-border px-3 py-2"
          {...register("address")}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-text-muted">Phone</label>
          <input
            className="mt-1 w-full rounded-xl border border-border px-3 py-2"
            {...register("phone")}
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
      </div>
      <div>
        <label className="text-xs text-text-muted">Currency</label>
        <input type="hidden" {...register("currency", { required: true })} />
        <SearchableSelect
          className="mt-1"
          value={watch("currency")}
          onChange={(value) =>
            setValue("currency", value, { shouldValidate: true })
          }
          options={SUPPORTED_CURRENCIES.map((c) => ({
            value: c.code,
            label: `${c.code} (${getCurrencySymbol(c.code)}) - ${c.label}`,
          }))}
          placeholder="Currency"
        />
      </div>
      <div>
        <label className="text-xs text-text-muted">GST number</label>
        <input
          className="mt-1 w-full rounded-xl border border-border px-3 py-2"
          {...register("gstNumber")}
        />
      </div>

      <div className="rounded-xl border border-border p-4 space-y-3">
        <p className="text-sm font-semibold text-text-primary">POS options (Pakistan)</p>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" {...register("enableCreditSale")} />
          Enable udhaar (credit) sales at checkout
        </label>
      </div>

      <div className="rounded-xl border border-border p-4 space-y-3">
        <p className="text-sm font-semibold text-text-primary">FBR integration</p>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" {...register("fbrEnabled")} />
          Enable FBR real-time invoicing
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" {...register("fbrTier1")} />
          Tier-1 retailer (mandatory FBR compliance)
        </label>
        <div>
          <label className="text-xs text-text-muted">NTN / registration</label>
          <input
            className="mt-1 w-full rounded-xl border border-border px-3 py-2"
            {...register("fbrNtn")}
            placeholder="NTN-1234567"
          />
        </div>
        <div>
          <label className="text-xs text-text-muted">FBR POS ID</label>
          <input
            className="mt-1 w-full rounded-xl border border-border px-3 py-2"
            {...register("fbrPosId")}
            placeholder="Assigned by FBR/PRAL"
          />
        </div>
      </div>

      <div>
        <label className="text-xs text-text-muted">Logo</label>
        <div className="mt-2 space-y-2">
          {store.logo && (
            <img
              src={store.logo}
              alt="Store logo"
              className="h-16 rounded-lg border border-border"
            />
          )}
          <ImageUploadButton
            onUpload={onLogo}
            label="Upload logo"
            maxSize={5242880}
            className="bg-background hover:bg-primary/10 text-text-primary"
          />
        </div>
      </div>
      <button
        type="submit"
        className="px-4 py-2 rounded-xl bg-primary text-white font-semibold"
      >
        Save store
      </button>
    </form>
  );
}
