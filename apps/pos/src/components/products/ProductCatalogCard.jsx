import { useTranslation } from "../../context/LocaleContext";
import { formatCurrency } from "../../utils/format";
import { getProductHealth } from "../../utils/productAlerts";

function translateHealthLabel(label, t) {
  if (label === "Healthy") return t("products.health.healthy");
  if (label === "Out of stock") return t("products.outOfStock");
  return label;
}

export default function ProductCatalogCard({
  product,
  onEdit,
  onArchive,
  onRestore,
  onHardDelete,
}) {
  const { t } = useTranslation();
  const stock = Number(product.stock) || 0;
  const health = getProductHealth(product);
  const out = stock <= 0;
  const inactive = product.isActive === false;
  const imageUrl = product?.images?.[0] || "";

  const actions = inactive ? (
    <>
      <button
        type="button"
        className="flex-1 py-2 text-xs font-semibold bg-success text-white"
        onClick={(e) => {
          e.stopPropagation();
          onRestore?.(product);
        }}
      >
        {t("products.catalog.restore")}
      </button>
      <button
        type="button"
        className="flex-1 py-2 text-xs font-semibold bg-error text-white"
        onClick={(e) => {
          e.stopPropagation();
          onHardDelete?.(product);
        }}
      >
        {t("products.catalog.hardDelete")}
      </button>
    </>
  ) : (
    <>
      <button
        type="button"
        className="flex-1 py-2 text-xs font-semibold bg-primary text-white"
        onClick={(e) => {
          e.stopPropagation();
          onEdit?.(product);
        }}
      >
        {t("common.edit")}
      </button>
      <button
        type="button"
        className="flex-1 py-2 text-xs font-semibold bg-error text-white"
        onClick={(e) => {
          e.stopPropagation();
          onArchive?.(product);
        }}
      >
        {t("products.catalog.archive")}
      </button>
    </>
  );

  return (
    <article
      className={`group flex flex-col border border-border bg-surface overflow-hidden ${
        out || inactive ? "opacity-80" : ""
      }`}
    >
      <div className="relative h-32 shrink-0 bg-gradient-to-br from-primary/15 to-accent/15">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name || t("products.imageAlt")}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-2xl font-bold text-primary">
            {(product.name || "?").slice(0, 2).toUpperCase()}
          </div>
        )}

        {inactive && (
          <span className="absolute left-2 top-2 bg-rose-100 px-2 py-0.5 text-[10px] font-semibold text-rose-700">
            {t("products.catalog.inactive")}
          </span>
        )}

        {out && (
          <span className="absolute right-2 top-2 bg-white/90 px-2 py-0.5 text-[10px] font-bold text-error">
            {t("products.outOfStock")}
          </span>
        )}

        <div className="absolute inset-0 hidden items-end gap-2 bg-[#0a2f2c]/75 p-2 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 md:flex">
          {actions}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3">
        <p className="line-clamp-2 text-sm font-semibold text-text-primary">
          {product.name}
        </p>
        <p className="text-[11px] text-text-muted">{product.category}</p>
        <div className="mt-1 flex items-center justify-between gap-2">
          <span className="text-sm font-bold text-primary">
            {formatCurrency(product.price)}
          </span>
          {!out && (
            <span
              className={`shrink-0 px-2 py-0.5 text-[10px] font-medium ${
                health.variant === "danger"
                  ? "bg-red-50 text-red-800"
                  : health.variant === "warning"
                    ? "bg-amber-50 text-amber-900"
                    : "bg-emerald-50 text-emerald-800"
              }`}
            >
              {translateHealthLabel(health.label, t)}
            </span>
          )}
        </div>
        <div className="mt-2 flex gap-2 border-t border-border pt-2 md:hidden">
          {actions}
        </div>
      </div>
    </article>
  );
}
