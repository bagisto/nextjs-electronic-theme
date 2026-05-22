"use client";

import { useEffect, useRef, useState } from "react";
import ChevronDownIcon from "@/components/common/icons/ChevronDownIcon";

export interface DropdownOption {
  value: string;
  label: string;
  groupLabel?: string;
}

type SingleProps = {
  multiple?: false;
  value: string;
  onChange: (value: string) => void;
};

type MultiProps = {
  multiple: true;
  value: string[];
  onChange: (value: string[]) => void;
};

type CommonProps = {
  options: DropdownOption[];
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
  loadingMessage?: string;
  emptyMessage?: string;
  className?: string;
  ariaLabel?: string;
  name?: string;
  invalid?: boolean;
};

type CustomDropdownProps = CommonProps & (SingleProps | MultiProps);

export default function CustomDropdown(props: CustomDropdownProps) {
  const {
    options,
    placeholder = "Select an option",
    disabled = false,
    loading = false,
    loadingMessage = "Loading...",
    emptyMessage = "No options available",
    className = "",
    ariaLabel,
    name,
    invalid = false,
  } = props;

  const isMulti = props.multiple === true;
  const selectedValues: string[] = isMulti
    ? (props.value as string[])
    : props.value
    ? [props.value as string]
    : [];

  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onDocMouseDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("mousedown", onDocMouseDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocMouseDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [isOpen]);

  const isInteractive = !disabled && !loading;

  const grouped = options.reduce<Record<string, DropdownOption[]>>(
    (acc, opt) => {
      const key = opt.groupLabel || "";
      acc[key] = acc[key] || [];
      acc[key].push(opt);
      return acc;
    },
    {}
  );

  const handleSelect = (optValue: string) => {
    if (isMulti) {
      const next = selectedValues.includes(optValue)
        ? selectedValues.filter((v) => v !== optValue)
        : [...selectedValues, optValue];
      (props.onChange as (v: string[]) => void)(next);
    } else {
      (props.onChange as (v: string) => void)(optValue);
      setIsOpen(false);
    }
  };

  const buttonLabel = (() => {
    if (loading) return loadingMessage;
    if (!selectedValues.length) return placeholder;
    if (isMulti) {
      const labels = options
        .filter((o) => selectedValues.includes(o.value))
        .map((o) => o.label);
      if (!labels.length) return placeholder;
      if (labels.length <= 2) return labels.join(", ");
      return `${labels[0]}, ${labels[1]} +${labels.length - 2}`;
    }
    const selected = options.find((o) => o.value === selectedValues[0]);
    return selected ? selected.label : placeholder;
  })();

  const hasSelection = selectedValues.length > 0;

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      {name && (
        <input
          type="hidden"
          name={name}
          value={isMulti ? selectedValues.join(",") : selectedValues[0] ?? ""}
        />
      )}

      <button
        type="button"
        onClick={() => isInteractive && setIsOpen((v) => !v)}
        disabled={!isInteractive}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel}
        className={`flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
          isInteractive
            ? `cursor-pointer bg-white dark:bg-neutral-900 ${
                hasSelection
                  ? "text-neutral-900 dark:text-white"
                  : "text-neutral-400 dark:text-neutral-500"
              } ${
                invalid
                  ? "border-red-500"
                  : isOpen
                  ? "border-green-500"
                  : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600"
              }`
            : "cursor-not-allowed opacity-60 border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-400 dark:text-neutral-500"
        }`}
      >
        <span className="truncate text-left flex-1">{buttonLabel}</span>
        <ChevronDownIcon
          className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      <div
        role="listbox"
        aria-multiselectable={isMulti}
        className={`absolute left-0 right-0 z-50 mt-2 max-h-64 overflow-y-auto rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 shadow-lg transition-all duration-150 ${
          isOpen && isInteractive
            ? "opacity-100 translate-y-0"
            : "pointer-events-none opacity-0 -translate-y-1"
        }`}
      >
        {options.length === 0 ? (
          <p className="px-3 py-3 text-xs text-neutral-500 dark:text-neutral-400">
            {emptyMessage}
          </p>
        ) : (
          <div className="py-1">
            {Object.entries(grouped).map(([groupLabel, items]) => (
              <div key={groupLabel || "default"}>
                {groupLabel && (
                  <p className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                    {groupLabel}
                  </p>
                )}
                {items.map((opt) => {
                  const isActive = selectedValues.includes(opt.value);
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      role="option"
                      aria-selected={isActive}
                      onClick={() => handleSelect(opt.value)}
                      className={`flex w-full cursor-pointer items-center justify-between gap-2 px-3 py-2 text-left text-xs sm:text-sm transition-colors ${
                        isActive
                          ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 font-medium"
                          : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700"
                      }`}
                    >
                      <span className="truncate">{opt.label}</span>
                      {isActive && (
                        <svg
                          className="h-3.5 w-3.5 shrink-0 text-green-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
