const variants = {
  success: "bg-emerald-50 text-emerald-800 border-emerald-200",
  warning: "bg-amber-50 text-amber-900 border-amber-200",
  error: "bg-red-50 text-red-800 border-red-200",
  danger: "bg-red-50 text-red-800 border-red-200",
  neutral: "bg-gray-50 text-gray-700 border-gray-200",
  info: "bg-sky-50 text-sky-800 border-sky-200",
};

export default function Badge({ children, variant = "neutral" }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${variants[variant] || variants.neutral}`}
    >
      {children}
    </span>
  );
}
