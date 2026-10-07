import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import { forwardRef, useState } from "react";

const PasswordInput = forwardRef(function PasswordInput(
  {
    id,
    className = "",
    wrapperClassName = "",
    inputClassName = "w-full bg-transparent text-sm outline-none placeholder:text-text-muted",
    placeholder = "Your password",
    leftIcon: LeftIcon = LockKeyhole,
    showLeftIcon = true,
    ...props
  },
  ref,
) {
  const [visible, setVisible] = useState(false);

  return (
    <div
      className={`flex items-center gap-3 rounded-2xl border border-border bg-background px-3 py-3 focus-within:ring-2 focus-within:ring-accent/40 ${wrapperClassName}`}
    >
      {showLeftIcon && LeftIcon ? (
        <LeftIcon className="h-4 w-4 shrink-0 text-text-muted" aria-hidden />
      ) : null}
      <input
        ref={ref}
        id={id}
        type={visible ? "text" : "password"}
        className={`${inputClassName} ${className}`.trim()}
        placeholder={placeholder}
        {...props}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="shrink-0 text-text-muted hover:text-primary"
        aria-label={visible ? "Hide password" : "Show password"}
        tabIndex={0}
      >
        {visible ? (
          <EyeOff className="h-4 w-4" aria-hidden />
        ) : (
          <Eye className="h-4 w-4" aria-hidden />
        )}
      </button>
    </div>
  );
});

export default PasswordInput;
