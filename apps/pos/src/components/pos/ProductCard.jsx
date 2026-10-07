import { motion } from "framer-motion";
import { useTranslation } from "../../context/LocaleContext";
import { formatCurrency } from "../../utils/format";
import { getProductHealth } from "../../utils/productAlerts";

function translateHealthLabel(label, t) {
  if (label === "Healthy") return t("products.health.healthy");
  if (label === "Out of stock") return t("products.outOfStock");
  return label;
}

export default function ProductCard({ product, onAdd, list }) {
  const { t } = useTranslation();
  const stock = Number(product.stock) || 0;
  const health = getProductHealth(product);
  const out = stock <= 0;
  const imageUrl = product?.images?.[0] || "";

  const body = (
    <div
      className={`relative rounded-2xl border border-border bg-surface overflow-hidden shadow-sm ${
        out ? "opacity-60" : "hover:shadow-md"
      } ${list ? "flex gap-3 p-3" : "p-3"}`}
    >
      {out && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-10 text-xs font-bold text-error">
          {t("products.outOfStock")}
        </div>
      )}
      <div
        className={`${list ? "w-16 h-16 shrink-0" : "h-28"} rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-primary font-bold overflow-hidden`}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name || t("products.imageAlt")}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          (product.name || "?").slice(0, 2).toUpperCase()
        )}
      </div>
      <div className={list ? "flex-1 min-w-0" : "mt-3"}>
        <p className="text-sm font-semibold text-text-primary line-clamp-2">
          {product.name}
        </p>
        <p className="text-[11px] text-text-muted mt-0.5">{product.category}</p>
        <div className="flex items-center justify-between mt-2 gap-2">
          <span className="text-sm font-bold text-primary">
            {formatCurrency(product.price)}
          </span>
          {!out && (
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
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
      </div>
    </div>
  );

  if (out) {
    return <div className="cursor-not-allowed">{body}</div>;
  }

  return (
    <motion.button
      type="button"
      layout
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onAdd(product)}
      className="text-left w-full"
    >
      {body}
    </motion.button>
  );
}
