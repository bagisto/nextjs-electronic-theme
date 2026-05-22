"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";

interface CustomDatePickerProps {
  value: string;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
  placeholder?: string;
  className?: string;
  name?: string;
  id?: string;
  disabled?: boolean;
  size?: "sm" | "md";
}

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function pad(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}

function toISO(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function parseISO(s: string): Date | null {
  if (!s) return null;
  const [y, m, d] = s.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

function formatDisplay(s: string): string {
  const d = parseISO(s);
  if (!d) return "";
  return `${pad(d.getDate())} ${MONTHS[d.getMonth()].slice(0, 3)} ${d.getFullYear()}`;
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export default function CustomDatePicker({
  value,
  onChange,
  min,
  max,
  placeholder = "Select date",
  className,
  name,
  id,
  disabled,
  size = "sm",
}: CustomDatePickerProps) {
  const [open, setOpen] = useState(false);
  const today = useMemo(() => startOfDay(new Date()), []);
  const initial = parseISO(value) || today;
  const [viewYear, setViewYear] = useState(initial.getFullYear());
  const [viewMonth, setViewMonth] = useState(initial.getMonth());
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = parseISO(value);
  const minDate = parseISO(min || "");
  const maxDate = parseISO(max || "");

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    if (open && selected) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setViewYear(selected.getFullYear());
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setViewMonth(selected.getMonth());
    }
  }, [open]);

  const firstWeekday = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells: (Date | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(viewYear, viewMonth, i + 1)),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const goPrev = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };
  const goNext = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const isDisabled = (d: Date) => {
    if (minDate && d < minDate) return true;
    if (maxDate && d > maxDate) return true;
    return false;
  };

  const yearOptions = useMemo(() => {
    const min = minDate?.getFullYear() ?? viewYear - 80;
    const max = maxDate?.getFullYear() ?? viewYear + 20;
    const start = Math.min(min, viewYear - 80);
    const end = Math.max(max, viewYear + 20);
    const list: number[] = [];
    for (let y = end; y >= start; y--) list.push(y);
    return list;
  }, [minDate, maxDate, viewYear]);

  return (
    <div ref={containerRef} className={clsx("relative", className)}>
      <button
        type="button"
        id={id}
        disabled={disabled}
        onClick={() => !disabled && setOpen((v) => !v)}
        className={clsx(
          "w-full flex items-center justify-between rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-left transition-colors",
          size === "md" ? "px-4 py-3 text-sm" : "px-3 py-2 text-sm",
          "text-neutral-900 dark:text-white",
          "hover:border-neutral-400 dark:hover:border-neutral-600",
          "focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:focus:ring-neutral-500",
          disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
        )}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span className={clsx(!value && "text-neutral-400 dark:text-neutral-500")}>
          {value ? formatDisplay(value) : placeholder}
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.6}
          stroke="currentColor"
          className="w-4 h-4 text-neutral-500 dark:text-neutral-400 shrink-0 ml-2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6.75 3v2.25M17.25 3v2.25M3 8.25h18M4.5 6h15a1.5 1.5 0 0 1 1.5 1.5v12a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 19.5v-12A1.5 1.5 0 0 1 4.5 6Z"
          />
        </svg>
      </button>

      {name && <input type="hidden" name={name} value={value} />}

      {open && (
        <div
          role="dialog"
          className="absolute z-50 mt-2 w-[18rem] rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-lg p-3"
        >
          <div className="flex items-center justify-between mb-2">
            <button
              type="button"
              onClick={goPrev}
              className="p-1.5 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 cursor-pointer"
              aria-label="Previous month"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
              </svg>
            </button>
            <div className="flex items-center gap-1">
              <select
                value={viewMonth}
                onChange={(e) => setViewMonth(Number(e.target.value))}
                className="text-sm font-medium bg-transparent text-neutral-900 dark:text-white px-1.5 py-1 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 focus:outline-none"
              >
                {MONTHS.map((m, i) => (
                  <option key={m} value={i} className="bg-white dark:bg-neutral-900">
                    {m}
                  </option>
                ))}
              </select>
              <select
                value={viewYear}
                onChange={(e) => setViewYear(Number(e.target.value))}
                className="text-sm font-medium bg-transparent text-neutral-900 dark:text-white px-1.5 py-1 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 focus:outline-none"
              >
                {yearOptions.map((y) => (
                  <option key={y} value={y} className="bg-white dark:bg-neutral-900">
                    {y}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={goNext}
              className="p-1.5 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 cursor-pointer"
              aria-label="Next month"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-1">
            {WEEKDAYS.map((w) => (
              <div
                key={w}
                className="text-[11px] font-semibold text-center text-neutral-500 dark:text-neutral-400 py-1"
              >
                {w}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {cells.map((d, idx) => {
              if (!d) return <div key={idx} />;
              const isSelected = selected && isSameDay(d, selected);
              const isToday = isSameDay(d, today);
              const disabledCell = isDisabled(d);
              return (
                <button
                  key={idx}
                  type="button"
                  disabled={disabledCell}
                  onClick={() => {
                    onChange(toISO(d));
                    setOpen(false);
                  }}
                  className={clsx(
                    "h-8 w-full text-sm rounded-md transition-colors flex items-center justify-center",
                    disabledCell
                      ? "text-neutral-300 dark:text-neutral-600 cursor-not-allowed"
                      : isSelected
                      ? "bg-green-500 text-white font-semibold cursor-pointer"
                      : isToday
                      ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white font-semibold hover:bg-neutral-200 dark:hover:bg-neutral-700 cursor-pointer"
                      : "text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
                  )}
                >
                  {d.getDate()}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between mt-3 pt-2 border-t border-neutral-100 dark:border-neutral-800">
            <button
              type="button"
              onClick={() => {
                onChange(toISO(today));
                setViewYear(today.getFullYear());
                setViewMonth(today.getMonth());
                setOpen(false);
              }}
              className="text-xs font-medium text-green-600 dark:text-green-400 hover:underline cursor-pointer"
            >
              Today
            </button>
            {value && (
              <button
                type="button"
                onClick={() => {
                  onChange("");
                  setOpen(false);
                }}
                className="text-xs font-medium text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
