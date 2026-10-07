import { addDays, addYears, startOfDay } from "date-fns";
import { ImagePlus, ScanLine, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import useAuthStore from "../../stores/authStore";
import useProductStore from "../../stores/productStore";
import useSupplierStore from "../../stores/supplierStore";
import BarcodeScannerModal from "../ui/BarcodeScannerModal";
import DatePicker from "../ui/DatePicker";
import Modal from "../ui/Modal";
import SearchableSelect from "../ui/SearchableSelect";
import { useTranslation } from "../../context/LocaleContext";

function normalizeBarcode(value) {
  return String(value || "")
    .replace(/\s+/g, "")
    .trim()
    .toLowerCase();
}

export default function ProductForm({ open, onClose, product }) {
  const { t } = useTranslation();
  const { store, userDoc } = useAuthStore();
  const { addProduct, updateProduct, products } = useProductStore();
  const { suppliers, subscribeSuppliers, cleanup } = useSupplierStore();
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm();
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [busy, setBusy] = useState(false);
  const [scanOpen, setScanOpen] = useState(false);
  const fileInputRef = useRef(null);

  const existingImages = product?.images || [];

  const stockVal = Number(watch("stock") || 0);
  const costVal = Number(watch("costPrice") || 0);

  useEffect(() => {
    if (!userDoc?.storeId) return undefined;
    subscribeSuppliers(userDoc.storeId);
    return () => cleanup();
  }, [userDoc?.storeId, subscribeSuppliers, cleanup]);

  useEffect(() => {
    if (!open) return;
    if (product) {
      reset({
        name: product.name,
        sku: product.sku,
        barcode: product.barcode,
        category: product.category,
        price: product.price,
        costPrice: product.costPrice,
        stock: product.stock,
        lowStockThreshold: product.lowStockThreshold,
        expiryWarningDays: product.expiryWarningDays ?? 90,
        taxRate: product.taxRate,
        unit: product.unit || "pcs",
        wholesalePrice: product.wholesalePrice ?? "",
        batchNumber: product.batchNumber || "",
        expiryDate: product.expiryDate || "",
        lastRestockDate: product.lastRestockDate || "",
        storageLocation: product.storageLocation || "",
        supplierId: product.supplierId || "",
        supplierName: product.supplierName || "",
        supplierContact: product.supplierContact || "",
        supplierEmail: product.supplierEmail || "",
        supplierLocation: product.supplierLocation || "",
        description: product.description,
      });
    } else {
      reset({
        name: "",
        sku: "",
        barcode: "",
        category: store?.categories?.[0] || "",
        price: "",
        costPrice: "",
        wholesalePrice: "",
        stock: "",
        lowStockThreshold: 5,
        expiryWarningDays: 90,
        taxRate: store?.taxRates?.[0]?.rate ?? 18,
        unit: "pcs",
        batchNumber: "",
        expiryDate: "",
        lastRestockDate: "",
        storageLocation: "",
        supplierId: "",
        supplierName: "",
        supplierContact: "",
        supplierEmail: "",
        supplierLocation: "",
        description: "",
      });
    }
    setFiles([]);
    setPreviews([]);
  }, [open, product, reset, store]);

  useEffect(() => {
    if (!files.length) {
      setPreviews([]);
      return undefined;
    }
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviews(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [files]);

  const onFilesSelected = (fileList) => {
    const next = Array.from(fileList || []).filter((f) =>
      f.type.startsWith("image/"),
    );
    if (!next.length) return;
    setFiles((prev) => [...prev, ...next]);
  };

  const removeSelectedFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const onSupplierChange = (supplierId) => {
    const s = (suppliers || []).find((x) => x.id === supplierId);
    if (!s) {
      setValue("supplierName", "");
      setValue("supplierContact", "");
      setValue("supplierEmail", "");
      setValue("supplierLocation", "");
      return;
    }
    setValue("supplierName", s.name || "");
    setValue("supplierContact", s.contactNumber || "");
    setValue("supplierEmail", s.email || "");
    setValue("supplierLocation", s.location || "");
  };

  const onSubmit = async (data) => {
    if (!userDoc?.storeId) return;
    setBusy(true);
    try {
      if (product) {
        await updateProduct(
          userDoc.storeId,
          product.id,
          {
            name: data.name,
            sku: data.sku,
            barcode: String(data.barcode || "").trim(),
            category: data.category,
            price: Number(data.price),
            costPrice: Number(data.costPrice) || 0,
            wholesalePrice:
              Number(data.wholesalePrice) || Number(data.price) || 0,
            stock: Number(data.stock),
            lowStockThreshold: Number(data.lowStockThreshold) || 0,
            expiryWarningDays: Number(data.expiryWarningDays) || 90,
            taxRate: Number(data.taxRate) || 0,
            unit: data.unit || "pcs",
            batchNumber: data.batchNumber || "",
            expiryDate: data.expiryDate || "",
            lastRestockDate: data.lastRestockDate || "",
            storageLocation: data.storageLocation || "",
            supplierId: data.supplierId || "",
            supplierName: data.supplierName || "",
            supplierContact: data.supplierContact || "",
            supplierEmail: data.supplierEmail || "",
            supplierLocation: data.supplierLocation || "",
            description: data.description || "",
            isActive: true,
          },
          files,
          product.images || [],
        );
        toast.success(t("toast.updated"));
      } else {
        await addProduct(
          userDoc.storeId,
          {
            name: data.name,
            sku: data.sku,
            barcode: String(data.barcode || "").trim(),
            category: data.category,
            price: Number(data.price),
            costPrice: Number(data.costPrice) || 0,
            wholesalePrice:
              Number(data.wholesalePrice) || Number(data.price) || 0,
            stock: Number(data.stock),
            lowStockThreshold: Number(data.lowStockThreshold) || 0,
            expiryWarningDays: Number(data.expiryWarningDays) || 90,
            taxRate: Number(data.taxRate) || 0,
            unit: data.unit || "pcs",
            batchNumber: data.batchNumber || "",
            expiryDate: data.expiryDate || "",
            lastRestockDate: data.lastRestockDate || "",
            storageLocation: data.storageLocation || "",
            supplierId: data.supplierId || "",
            supplierName: data.supplierName || "",
            supplierContact: data.supplierContact || "",
            supplierEmail: data.supplierEmail || "",
            supplierLocation: data.supplierLocation || "",
            description: data.description || "",
          },
          files,
        );
        toast.success(t("toast.saved"));
      }
      onClose?.();
    } catch (e) {
      toast.error(e?.message || t("toast.failed"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={product ? t("products.edit") : t("products.add")}
      wide
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 text-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <label className="text-xs text-text-muted">Name *</label>
            <input
              className="mt-1 w-full rounded-xl border border-border px-3 py-2"
              {...register("name", { required: "Name is required" })}
            />
            {errors.name && (
              <p className="text-error text-xs mt-1">{errors.name.message}</p>
            )}
          </div>
          <div>
            <label className="text-xs text-text-muted">Category *</label>
            <input
              type="hidden"
              {...register("category", { required: "Category is required" })}
            />
            <SearchableSelect
              className="mt-1"
              value={watch("category")}
              onChange={(value) =>
                setValue("category", value, { shouldValidate: true })
              }
              options={(store?.categories || []).map((c) => ({
                value: c,
                label: c,
              }))}
              placeholder="Category"
            />
            {errors.category && (
              <p className="text-error text-xs mt-1">
                {errors.category.message}
              </p>
            )}
          </div>
          <div>
            <label className="text-xs text-text-muted">Tax %</label>
            <input type="hidden" {...register("taxRate")} />
            <SearchableSelect
              className="mt-1"
              value={String(watch("taxRate") ?? "")}
              onChange={(value) =>
                setValue("taxRate", Number(value), { shouldValidate: true })
              }
              options={(store?.taxRates || []).map((t) => ({
                value: String(t.rate),
                label: t.name,
              }))}
              placeholder="Tax rate"
            />
          </div>
          <div>
            <label className="text-xs text-text-muted">Price *</label>
            <input
              type="number"
              step="0.01"
              className="mt-1 w-full rounded-xl border border-border px-3 py-2"
              {...register("price", {
                required: "Price is required",
                min: { value: 0.01, message: "Price must be greater than 0" },
              })}
            />
            {errors.price && (
              <p className="text-error text-xs mt-1">{errors.price.message}</p>
            )}
          </div>
          <div>
            <label className="text-xs text-text-muted">Cost</label>
            <input
              type="number"
              step="0.01"
              className="mt-1 w-full rounded-xl border border-border px-3 py-2"
              {...register("costPrice")}
            />
          </div>
          <div>
            <label className="text-xs text-text-muted">Wholesale price</label>
            <input
              type="number"
              step="0.01"
              className="mt-1 w-full rounded-xl border border-border px-3 py-2"
              {...register("wholesalePrice")}
            />
          </div>
          <div>
            <label className="text-xs text-text-muted">Unit</label>
            <input
              className="mt-1 w-full rounded-xl border border-border px-3 py-2"
              placeholder="pcs"
              {...register("unit")}
            />
          </div>
          <div>
            <label className="text-xs text-text-muted">Stock *</label>
            <input
              type="number"
              className="mt-1 w-full rounded-xl border border-border px-3 py-2"
              {...register("stock", {
                required: "Stock is required",
                min: { value: 0, message: "Stock cannot be negative" },
              })}
            />
            {errors.stock && (
              <p className="text-error text-xs mt-1">{errors.stock.message}</p>
            )}
          </div>
          <div>
            <label className="text-xs text-text-muted">
              Low stock threshold
            </label>
            <input
              type="number"
              className="mt-1 w-full rounded-xl border border-border px-3 py-2"
              {...register("lowStockThreshold")}
            />
            <p className="mt-1 text-[11px] text-text-muted">
              Alerts will show when stock reaches this level.
            </p>
          </div>
          <div>
            <label className="text-xs text-text-muted">SKU</label>
            <input
              className="mt-1 w-full rounded-xl border border-border px-3 py-2"
              {...register("sku")}
            />
          </div>
          <div>
            <label className="text-xs text-text-muted">
              Barcode (optional)
            </label>
            <div className="mt-1 flex gap-2">
              <input
                placeholder="Leave empty if product has no barcode"
                className="flex-1 rounded-xl border border-border px-3 py-2"
                {...register("barcode")}
              />
              <button
                type="button"
                className="shrink-0 p-2.5 rounded-xl bg-accent text-white hover:opacity-90"
                onClick={() => setScanOpen(true)}
                aria-label="Scan barcode"
                title="Scan barcode"
              >
                <ScanLine className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div>
            <label className="text-xs text-text-muted">Batch number</label>
            <input
              className="mt-1 w-full rounded-xl border border-border px-3 py-2"
              {...register("batchNumber")}
            />
          </div>
          <div>
            <label className="text-xs text-text-muted" htmlFor="product-expiry-date">
              Expiry date
            </label>
            <DatePicker
              id="product-expiry-date"
              className="mt-1"
              value={watch("expiryDate") || ""}
              onChange={(v) =>
                setValue("expiryDate", v, { shouldDirty: true, shouldValidate: true })
              }
              placeholder="dd/mm/yyyy"
              shortcuts={[
                {
                  label: "+30 days",
                  getValue: () => addDays(new Date(), 30),
                },
                {
                  label: "+90 days",
                  getValue: () => addDays(new Date(), 90),
                },
                {
                  label: "+1 year",
                  getValue: () => addYears(new Date(), 1),
                },
              ]}
            />
            <p className="mt-1 text-[11px] text-text-muted">
              Used with the expiry warning window below.
            </p>
          </div>
          <div>
            <label className="text-xs text-text-muted">
              Expiry warning window (days)
            </label>
            <input
              type="number"
              min="1"
              className="mt-1 w-full rounded-xl border border-border px-3 py-2"
              {...register("expiryWarningDays")}
            />
            <p className="mt-1 text-[11px] text-text-muted">
              Warning starts this many days before the expiry date. Default is
              90.
            </p>
          </div>
          <div>
            <label
              className="text-xs text-text-muted"
              htmlFor="product-restock-date"
            >
              Last restock date
            </label>
            <DatePicker
              id="product-restock-date"
              className="mt-1"
              value={watch("lastRestockDate") || ""}
              onChange={(v) =>
                setValue("lastRestockDate", v, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
              maxDate={startOfDay(new Date())}
              placeholder="dd/mm/yyyy"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs text-text-muted">Storage location</label>
            <input
              className="mt-1 w-full rounded-xl border border-border px-3 py-2"
              {...register("storageLocation")}
            />
          </div>
          <div>
            <label className="text-xs text-text-muted">Supplier</label>
            <input type="hidden" {...register("supplierId")} />
            <SearchableSelect
              className="mt-1"
              value={watch("supplierId")}
              onChange={(value) => {
                setValue("supplierId", value, { shouldValidate: true });
                onSupplierChange(value);
              }}
              options={[
                { value: "", label: "Select supplier" },
                ...(suppliers || []).map((s) => ({
                  value: s.id,
                  label: s.name,
                })),
              ]}
              placeholder="Supplier"
            />
          </div>
          <div>
            <label className="text-xs text-text-muted">Supplier contact</label>
            <input
              className="mt-1 w-full rounded-xl border border-border px-3 py-2"
              {...register("supplierContact")}
            />
          </div>
          <div>
            <label className="text-xs text-text-muted">Supplier email</label>
            <input
              type="email"
              className="mt-1 w-full rounded-xl border border-border px-3 py-2"
              {...register("supplierEmail")}
            />
          </div>
          <div>
            <label className="text-xs text-text-muted">Supplier location</label>
            <input
              className="mt-1 w-full rounded-xl border border-border px-3 py-2"
              {...register("supplierLocation")}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs text-text-muted">Total stock value</label>
            <input
              readOnly
              value={(stockVal * costVal).toFixed(2)}
              className="mt-1 w-full rounded-xl border border-border px-3 py-2 bg-background text-text-muted"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs text-text-muted">Description</label>
            <textarea
              rows={3}
              className="mt-1 w-full rounded-xl border border-border px-3 py-2"
              {...register("description")}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs text-text-muted">Images</label>
            <div className="mt-1 rounded-xl border-2 border-dashed border-border bg-background/50 overflow-hidden">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                className="sr-only"
                onChange={(e) => {
                  onFilesSelected(e.target.files);
                  e.target.value = "";
                }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex flex-col items-center justify-center gap-2 px-4 py-6 text-center hover:bg-background transition-colors"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent/15 text-accent">
                  <ImagePlus className="h-5 w-5" />
                </span>
                <span className="text-sm font-semibold text-text-primary">
                  Choose images
                </span>
                <span className="text-xs text-text-muted">
                  PNG, JPG, WEBP · multiple files
                </span>
              </button>

              {(existingImages.length > 0 || previews.length > 0) && (
                <div className="px-3 pb-3 pt-0 border-t border-border/80">
                  <p className="text-[11px] font-medium text-text-muted mb-2 pt-3">
                    {existingImages.length > 0 && previews.length > 0
                      ? "Saved & new images"
                      : existingImages.length > 0
                        ? "Current images"
                        : "New images"}
                  </p>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {existingImages.map((url, i) => (
                      <div
                        key={`saved-${url}-${i}`}
                        className="relative aspect-square rounded-lg overflow-hidden border border-border bg-surface"
                      >
                        <img
                          src={url}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                        <span className="absolute bottom-0 inset-x-0 bg-black/50 text-[9px] text-white text-center py-0.5">
                          Saved
                        </span>
                      </div>
                    ))}
                    {previews.map((url, i) => (
                      <div
                        key={`new-${url}`}
                        className="relative aspect-square rounded-lg overflow-hidden border border-accent/40 bg-surface"
                      >
                        <img
                          src={url}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeSelectedFile(i)}
                          className="absolute top-1 right-1 p-0.5 rounded-full bg-black/60 text-white hover:bg-black/80"
                          aria-label="Remove image"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                  {files.length > 0 && (
                    <p className="mt-2 text-xs text-text-muted truncate">
                      {files.map((f) => f.name).join(", ")}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        <button
          type="submit"
          disabled={busy}
          className="w-full py-2.5 rounded-xl bg-primary text-white font-semibold"
        >
          {busy ? t("ui.pleaseWait") : t("common.save")}
        </button>
      </form>

      <BarcodeScannerModal
        open={scanOpen}
        onClose={() => setScanOpen(false)}
        onDetected={(code) => {
          setValue("barcode", code, { shouldDirty: true });
          const normalized = normalizeBarcode(code);
          const match = products.find(
            (item) =>
              normalizeBarcode(item.barcode) === normalized &&
              item.isActive !== false,
          );

          if (match) {
            setValue("name", match.name || "", { shouldDirty: true });
            setValue("sku", match.sku || "", { shouldDirty: true });
            setValue("category", match.category || "", { shouldDirty: true });
            setValue("price", match.price ?? "", { shouldDirty: true });
            setValue("costPrice", match.costPrice ?? "", { shouldDirty: true });
            setValue("wholesalePrice", match.wholesalePrice ?? "", {
              shouldDirty: true,
            });
            setValue("stock", match.stock ?? "", { shouldDirty: true });
            setValue("lowStockThreshold", match.lowStockThreshold ?? 5, {
              shouldDirty: true,
            });
            setValue("expiryDate", match.expiryDate || "", {
              shouldDirty: true,
            });
            setValue("expiryWarningDays", match.expiryWarningDays ?? 90, {
              shouldDirty: true,
            });
            setValue("unit", match.unit || "pcs", { shouldDirty: true });
            setValue("batchNumber", match.batchNumber || "", {
              shouldDirty: true,
            });
            setValue("storageLocation", match.storageLocation || "", {
              shouldDirty: true,
            });
            setValue("supplierId", match.supplierId || "", {
              shouldDirty: true,
            });
            setValue("supplierName", match.supplierName || "", {
              shouldDirty: true,
            });
            setValue("supplierContact", match.supplierContact || "", {
              shouldDirty: true,
            });
            setValue("supplierEmail", match.supplierEmail || "", {
              shouldDirty: true,
            });
            setValue("supplierLocation", match.supplierLocation || "", {
              shouldDirty: true,
            });
            setValue("description", match.description || "", {
              shouldDirty: true,
            });
            toast.success(t("toast.barcodeMatched"));
            return;
          }

          toast.success(t("toast.barcodeScanned"));
        }}
      />
    </Modal>
  );
}
