import { Upload } from "lucide-react";
import { useRef } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "../../context/LocaleContext";

export default function ImageUploadButton({
  onUpload,
  label,
  accept = "image/*",
  maxSize = 5242880, // 5MB default
  className = "",
  disabled = false,
  isLoading = false,
}) {
  const { t } = useTranslation();
  const inputRef = useRef(null);
  const buttonLabel = label ?? t("common.uploadImage");

  const handleChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > maxSize) {
      toast.error(
        t("toast.fileTooLarge", {
          max: (maxSize / 1024 / 1024).toFixed(1),
        }),
      );
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error(t("toast.imagesOnly"));
      return;
    }

    try {
      await onUpload(file);
    } catch (err) {
      toast.error(err?.message || t("toast.uploadFailed"));
    }

    // Reset input
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
        disabled={disabled || isLoading}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={disabled || isLoading}
        className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-border font-medium text-sm transition ${
          disabled || isLoading
            ? "opacity-50 cursor-not-allowed"
            : "hover:bg-background active:scale-95"
        } ${className}`}
      >
        <Upload className="w-4 h-4" />
        {isLoading ? t("common.uploading") : buttonLabel}
      </button>
    </>
  );
}
