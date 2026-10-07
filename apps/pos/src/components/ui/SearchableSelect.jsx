import Select from "react-select";
import CreatableSelect from "react-select/creatable";

function normalizeOptions(options = []) {
  return options.map((opt) => {
    if (typeof opt === "string") {
      return { value: opt, label: opt };
    }
    return {
      value: String(opt.value ?? opt.code ?? ""),
      label: opt.label ?? opt.name ?? String(opt.value ?? opt.code ?? ""),
    };
  });
}

export default function SearchableSelect({
  options = [],
  value,
  onChange,
  placeholder = "Select...",
  isClearable = false,
  isSearchable = true,
  className = "",
  isDisabled = false,
  allowCustomOption = false,
  inputId,
  "aria-label": ariaLabel,
  label,
}) {
  const normalized = normalizeOptions(options);
  const selected =
    normalized.find((o) => o.value === String(value ?? "")) || null;
  const SelectComponent = allowCustomOption ? CreatableSelect : Select;
  const resolvedId =
    inputId ||
    (label
      ? `qs-${String(label).toLowerCase().replace(/\s+/g, "-")}`
      : undefined);

  const handleChange = (opt, meta) => {
    if (allowCustomOption && meta?.action === "create-option") {
      onChange?.(String(opt?.value ?? opt?.label ?? "").trim());
      return;
    }

    onChange?.(opt?.value ?? "");
  };

  return (
    <div className={className}>
      {label ? (
        <label htmlFor={resolvedId} className="mb-1.5 block text-sm font-medium text-text-primary">
          {label}
        </label>
      ) : null}
      <SelectComponent
        inputId={resolvedId}
        aria-label={ariaLabel || (!label ? placeholder : undefined)}
        options={normalized}
        value={selected}
        onChange={handleChange}
        placeholder={placeholder}
        isClearable={isClearable}
        isSearchable={isSearchable}
        isDisabled={isDisabled}
        formatCreateLabel={(inputValue) => `Add \"${inputValue}\"`}
        classNamePrefix="qs"
        styles={{
          control: (base, state) => ({
            ...base,
            minHeight: 40,
            borderRadius: 12,
            borderColor: state.isFocused ? "#2A9D8F" : "#E5E7EB",
            boxShadow: state.isFocused
              ? "0 0 0 2px rgba(42,157,143,0.2)"
              : "none",
            backgroundColor: "#FFFFFF",
            "&:hover": { borderColor: "#2A9D8F" },
          }),
          valueContainer: (base) => ({ ...base, padding: "0 10px" }),
          input: (base) => ({ ...base, margin: 0, padding: 0 }),
          placeholder: (base) => ({ ...base, color: "#6B7280", fontSize: 14 }),
          singleValue: (base) => ({ ...base, color: "#1A1A1A", fontSize: 14 }),
          menu: (base) => ({
            ...base,
            zIndex: 50,
            borderRadius: 12,
            overflow: "hidden",
          }),
          option: (base, state) => ({
            ...base,
            fontSize: 14,
            backgroundColor: state.isFocused ? "#F7F9FC" : "#FFFFFF",
            color: "#1A1A1A",
            cursor: "pointer",
          }),
        }}
      />
    </div>
  );
}
