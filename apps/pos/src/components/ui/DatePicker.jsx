import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isAfter,
  isBefore,
  isSameDay,
  isSameMonth,
  isValid,
  parse,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

const WEEK_STARTS_ON = 1;
const DISPLAY_FMT = "dd/MM/yyyy";
const STORAGE_FMT = "yyyy-MM-dd";
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function parseStorageValue(value) {
  const raw = String(value || "").trim();
  if (!raw) return null;
  const iso = parseISO(raw);
  if (isValid(iso)) return startOfDay(iso);
  const local = parse(raw, DISPLAY_FMT, new Date());
  if (isValid(local)) return startOfDay(local);
  return null;
}

function toStorage(date) {
  return format(startOfDay(date), STORAGE_FMT);
}

function clampViewMonth(date, minDate, maxDate) {
  let view = startOfMonth(date);
  if (minDate && isBefore(view, startOfMonth(minDate))) {
    view = startOfMonth(minDate);
  }
  if (maxDate && isAfter(view, startOfMonth(maxDate))) {
    view = startOfMonth(maxDate);
  }
  return view;
}

function buildYearRange(minDate, maxDate) {
  const now = new Date().getFullYear();
  const minY = minDate ? minDate.getFullYear() : now - 5;
  const maxY = maxDate ? maxDate.getFullYear() : now + 15;
  const years = [];
  for (let y = minY; y <= maxY; y += 1) years.push(y);
  return years;
}

export default function DatePicker({
  value = "",
  onChange,
  id: idProp,
  minDate,
  maxDate,
  placeholder = "Select date",
  className = "",
  clearable = true,
  shortcuts = [],
}) {
  const autoId = useId();
  const inputId = idProp || autoId;
  const anchorRef = useRef(null);
  const popoverRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(() =>
    clampViewMonth(parseStorageValue(value) || new Date(), minDate, maxDate),
  );
  const [pos, setPos] = useState({ top: 0, left: 0, width: 280 });
  const [headerMenu, setHeaderMenu] = useState(null);

  const selected = parseStorageValue(value);
  const min = minDate ? startOfDay(minDate) : null;
  const max = maxDate ? startOfDay(maxDate) : null;

  const updatePosition = useCallback(() => {
    const el = anchorRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const width = Math.max(rect.width, 280);
    let top = rect.bottom + 6;
    let left = rect.left;
    const popHeight = 360;
    if (top + popHeight > window.innerHeight - 8) {
      top = Math.max(8, rect.top - popHeight - 6);
    }
    if (left + width > window.innerWidth - 8) {
      left = Math.max(8, window.innerWidth - width - 8);
    }
    setPos({ top, left, width });
  }, []);

  useEffect(() => {
    if (!open) setHeaderMenu(null);
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    updatePosition();
    const onReflow = () => updatePosition();
    window.addEventListener("resize", onReflow);
    window.addEventListener("scroll", onReflow, true);
    return () => {
      window.removeEventListener("resize", onReflow);
      window.removeEventListener("scroll", onReflow, true);
    };
  }, [open, updatePosition]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onDown = (e) => {
      if (anchorRef.current?.contains(e.target)) return;
      if (popoverRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, [open]);

  useEffect(() => {
    const parsed = parseStorageValue(value);
    if (parsed) setViewMonth(clampViewMonth(parsed, min, max));
  }, [value]);

  const isDisabled = (day) => {
    const d = startOfDay(day);
    if (min && isBefore(d, min)) return true;
    if (max && isAfter(d, max)) return true;
    return false;
  };

  const pickDate = (day) => {
    if (isDisabled(day)) return;
    onChange?.(toStorage(day));
    setOpen(false);
  };

  const monthStart = startOfMonth(viewMonth);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: WEEK_STARTS_ON });
  const gridEnd = endOfWeek(endOfMonth(viewMonth), {
    weekStartsOn: WEEK_STARTS_ON,
  });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });
  const years = buildYearRange(min, max);

  const openPicker = () => {
    setHeaderMenu(null);
    setViewMonth(clampViewMonth(selected || new Date(), min, max));
    setOpen(true);
  };

  const popover =
    open &&
    typeof document !== "undefined" &&
    createPortal(
      <div
        ref={popoverRef}
        role="dialog"
        aria-label="Choose date"
        className="fixed z-[1200] border border-border bg-surface shadow-lg"
        style={{
          top: pos.top,
          left: pos.left,
          width: pos.width,
        }}
      >
        <div className="relative border-b border-border bg-primary px-3 py-2 text-white">
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              aria-label="Previous month"
              className="p-1 hover:bg-white/15"
              onClick={() => {
                setHeaderMenu(null);
                setViewMonth((m) => subMonths(m, 1));
              }}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="flex flex-1 items-center justify-center gap-2">
              <button
                type="button"
                aria-expanded={headerMenu === "month"}
                className="min-w-[5.5rem] border border-white/50 bg-white px-2 py-1 text-xs font-semibold text-text-primary hover:bg-background"
                onClick={() =>
                  setHeaderMenu((m) => (m === "month" ? null : "month"))
                }
              >
                {format(viewMonth, "MMMM")}
              </button>
              <button
                type="button"
                aria-expanded={headerMenu === "year"}
                className="min-w-[4rem] border border-white/50 bg-white px-2 py-1 text-xs font-semibold text-text-primary hover:bg-background"
                onClick={() =>
                  setHeaderMenu((m) => (m === "year" ? null : "year"))
                }
              >
                {viewMonth.getFullYear()}
              </button>
            </div>
            <button
              type="button"
              aria-label="Next month"
              className="p-1 hover:bg-white/15"
              onClick={() => {
                setHeaderMenu(null);
                setViewMonth((m) => addMonths(m, 1));
              }}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {headerMenu === "month" && (
            <div className="absolute left-3 right-3 top-full z-10 mt-1 grid grid-cols-3 gap-1 border border-border bg-white p-2">
              {Array.from({ length: 12 }, (_, i) => {
                const active = viewMonth.getMonth() === i;
                return (
                  <button
                    key={i}
                    type="button"
                    className={`py-1.5 text-xs font-semibold ${
                      active
                        ? "bg-primary text-white"
                        : "bg-white text-text-primary hover:bg-background"
                    }`}
                    onClick={() => {
                      setViewMonth(
                        clampViewMonth(
                          new Date(viewMonth.getFullYear(), i, 1),
                          min,
                          max,
                        ),
                      );
                      setHeaderMenu(null);
                    }}
                  >
                    {format(new Date(2024, i, 1), "MMM")}
                  </button>
                );
              })}
            </div>
          )}

          {headerMenu === "year" && (
            <div className="absolute left-3 right-3 top-full z-10 mt-1 max-h-44 overflow-y-auto border border-border bg-white p-1">
              {years.map((y) => {
                const active = viewMonth.getFullYear() === y;
                return (
                  <button
                    key={y}
                    type="button"
                    className={`block w-full px-2 py-1.5 text-left text-xs font-semibold ${
                      active
                        ? "bg-primary text-white"
                        : "bg-white text-text-primary hover:bg-background"
                    }`}
                    onClick={() => {
                      setViewMonth(
                        clampViewMonth(
                          new Date(y, viewMonth.getMonth(), 1),
                          min,
                          max,
                        ),
                      );
                      setHeaderMenu(null);
                    }}
                  >
                    {y}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="grid grid-cols-7 border-b border-border bg-background px-2 py-2">
          {WEEKDAYS.map((d) => (
            <div
              key={d}
              className="text-center text-[10px] font-semibold uppercase tracking-wide text-text-muted"
            >
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-px bg-border p-2">
          {days.map((day) => {
            const inMonth = isSameMonth(day, viewMonth);
            const selectedDay = selected && isSameDay(day, selected);
            const today = isSameDay(day, new Date());
            const disabled = isDisabled(day);
            return (
              <button
                key={day.toISOString()}
                type="button"
                disabled={disabled}
                onClick={() => pickDate(day)}
                className={[
                  "h-9 text-sm font-medium",
                  !inMonth && "text-text-muted/50",
                  inMonth && !disabled && "text-text-primary hover:bg-primary/10",
                  selectedDay && "bg-primary text-white hover:bg-primary",
                  today && !selectedDay && "ring-1 ring-inset ring-accent",
                  disabled && "cursor-not-allowed opacity-30",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {format(day, "d")}
              </button>
            );
          })}
        </div>

        {(shortcuts.length > 0 || clearable) && (
          <div className="flex flex-wrap items-center gap-2 border-t border-border bg-background px-3 py-2">
            {shortcuts.map((s) => (
              <button
                key={s.label}
                type="button"
                className="border border-border bg-white px-2 py-1 text-[11px] font-semibold text-text-primary hover:bg-background"
                onClick={() => {
                  const d = startOfDay(s.getValue());
                  if (!isDisabled(d)) pickDate(d);
                }}
              >
                {s.label}
              </button>
            ))}
            {clearable && value && (
              <button
                type="button"
                className="ml-auto text-[11px] font-semibold text-text-muted hover:text-error"
                onClick={() => {
                  onChange?.("");
                  setOpen(false);
                }}
              >
                Clear
              </button>
            )}
          </div>
        )}
      </div>,
      document.body,
    );

  return (
    <div className={className}>
      <div ref={anchorRef} className="relative">
        <input
          id={inputId}
          readOnly
          value={selected ? format(selected, DISPLAY_FMT) : ""}
          placeholder={placeholder}
          onClick={openPicker}
          onFocus={openPicker}
          className="w-full cursor-pointer border border-border bg-background py-2 pl-3 pr-10 text-sm outline-none focus:ring-2 focus:ring-accent/40"
        />
        <button
          type="button"
          tabIndex={-1}
          aria-label="Open calendar"
          className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-primary"
          onClick={openPicker}
        >
          <Calendar className="h-4 w-4" />
        </button>
      </div>
      {popover}
    </div>
  );
}
