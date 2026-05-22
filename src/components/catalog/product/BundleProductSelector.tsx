"use client";

import { useEffect, useMemo } from "react";
import { MinusIcon, PlusIcon } from "@heroicons/react/24/outline";
import { Price } from "@/components/theme/ui/Price";
import CustomDropdown, {
  type DropdownOption,
} from "@/components/common/form/CustomDropdown";

export type BundleOptionType = "radio" | "checkbox" | "select" | "multiselect";

export type BundleOptionProductNode = {
  id: string;
  qty?: number;
  isDefault?: boolean;
  isUserDefined?: boolean;
  sortOrder?: number;
  product: {
    id: string;
    name?: string;
    sku?: string;
    price?: string | number;
    baseImageUrl?: string;
  };
};

export type BundleOptionNode = {
  id: string;
  type: BundleOptionType;
  isRequired?: boolean;
  sortOrder?: number;
  translation?: { label?: string };
  bundleOptionProducts?: { edges: { node: BundleOptionProductNode }[] };
};

interface Props {
  bundleOptions: { edges: { node: BundleOptionNode }[] } | null | undefined;
  basePrice: number;
  currencyCode: string;
  selections: Record<string, string[]>;
  quantities: Record<string, number>;
  onSelectionsChange: (next: Record<string, string[]>) => void;
  onQuantitiesChange: (next: Record<string, number>) => void;
}

const extractId = (id: string) => String(id).split("/").pop() || id;

export function BundleProductSelector({
  bundleOptions,
  basePrice,
  currencyCode,
  selections,
  quantities,
  onSelectionsChange,
  onQuantitiesChange,
}: Props) {
  const optionEdges = bundleOptions?.edges || [];

  useEffect(() => {
    if (!optionEdges.length) return;
    if (Object.keys(selections).length) return;

    const initialSelections: Record<string, string[]> = {};
    const initialQty: Record<string, number> = {};

    for (const optEdge of optionEdges) {
      const opt = optEdge.node;
      const optId = extractId(opt.id);
      const productEdges = opt.bundleOptionProducts?.edges || [];

      const defaults = productEdges
        .filter((p) => p.node.isDefault)
        .map((p) => extractId(p.node.id));

      if (defaults.length) {
        initialSelections[optId] = defaults;
      } else if (
        opt.isRequired &&
        productEdges.length &&
        (opt.type === "radio" || opt.type === "select")
      ) {
        initialSelections[optId] = [extractId(productEdges[0].node.id)];
      } else {
        initialSelections[optId] = [];
      }

      for (const p of productEdges) {
        const pid = extractId(p.node.id);
        initialQty[pid] = p.node.qty || 1;
      }
    }

    onSelectionsChange(initialSelections);
    onQuantitiesChange(initialQty);
  }, [optionEdges, selections, onSelectionsChange, onQuantitiesChange]);

  const total = useMemo(() => {
    let sum = basePrice || 0;
    for (const optEdge of optionEdges) {
      const opt = optEdge.node;
      const optId = extractId(opt.id);
      const selectedIds = selections[optId] || [];
      const productEdges = opt.bundleOptionProducts?.edges || [];
      for (const p of productEdges) {
        const pid = extractId(p.node.id);
        if (selectedIds.includes(pid)) {
          const price = Number(p.node.product.price) || 0;
          const qty = quantities[pid] || p.node.qty || 1;
          sum += price * qty;
        }
      }
    }
    return sum;
  }, [optionEdges, selections, quantities, basePrice]);

  const toggleSelection = (opt: BundleOptionNode, productId: string) => {
    const optId = extractId(opt.id);
    const current = selections[optId] || [];
    const isMulti = opt.type === "checkbox" || opt.type === "multiselect";

    let next: string[];
    if (isMulti) {
      next = current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId];
    } else {
      // radio / select
      if (current.includes(productId)) {
        next = opt.isRequired ? current : [];
      } else {
        next = [productId];
      }
    }
    onSelectionsChange({ ...selections, [optId]: next });
  };

  const changeQty = (productId: string, delta: number) => {
    const current = quantities[productId] || 1;
    onQuantitiesChange({
      ...quantities,
      [productId]: Math.max(1, current + delta),
    });
  };

  if (!optionEdges.length) return null;

  return (
    <div className="space-y-5">
      {optionEdges.map((optEdge) => {
        const opt = optEdge.node;
        const optId = extractId(opt.id);
        const productEdges = opt.bundleOptionProducts?.edges || [];
        const selectedIds = selections[optId] || [];
        const isMulti = opt.type === "checkbox" || opt.type === "multiselect";

        return (
          <div key={opt.id} className="space-y-2">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
                {opt.translation?.label || `Option ${optId}`}
              </h3>
              {opt.isRequired && (
                <span className="text-xs text-red-500 font-medium">*</span>
              )}
            </div>

            {opt.type === "select" || opt.type === "multiselect" ? (
              (() => {
                const bundleOptions: DropdownOption[] = productEdges.map(
                  (p) => {
                    const pid = extractId(p.node.id);
                    const price = Number(p.node.product.price) || 0;
                    return {
                      value: pid,
                      label: `${p.node.product.name ?? ""}${
                        price > 0 ? ` (+${price})` : ""
                      }`,
                    };
                  }
                );
                const noneOption: DropdownOption[] =
                  !isMulti && !opt.isRequired
                    ? [{ value: "", label: "-- None --" }]
                    : [];
                const finalOptions = [...noneOption, ...bundleOptions];

                if (isMulti) {
                  return (
                    <CustomDropdown
                      multiple
                      value={selectedIds}
                      onChange={(next) =>
                        onSelectionsChange({ ...selections, [optId]: next })
                      }
                      options={finalOptions}
                      placeholder="Select options"
                      ariaLabel={opt.translation?.label || `Option ${optId}`}
                    />
                  );
                }
                return (
                  <CustomDropdown
                    value={selectedIds[0] || ""}
                    onChange={(v) =>
                      onSelectionsChange({
                        ...selections,
                        [optId]: v ? [v] : [],
                      })
                    }
                    options={finalOptions}
                    placeholder="Select an option"
                    ariaLabel={opt.translation?.label || `Option ${optId}`}
                  />
                );
              })()
            ) : (
              <div className="space-y-2">
                {productEdges.map((p) => {
                  const node = p.node;
                  const pid = extractId(node.id);
                  const isSelected = selectedIds.includes(pid);
                  const price = Number(node.product.price) || 0;
                  return (
                    <label
                      key={node.id}
                      className="flex items-center justify-between gap-3 p-3 rounded-xl border border-neutral-200 dark:border-neutral-700 cursor-pointer hover:border-green-500 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <input
                          type={isMulti ? "checkbox" : "radio"}
                          name={`bundle-${optId}`}
                          checked={isSelected}
                          onChange={() => toggleSelection(opt, pid)}
                          className="w-5 h-5 text-green-500 focus:ring-green-500"
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">
                            {node.product.name}
                          </p>
                          {price > 0 && (
                            <p className="text-xs text-neutral-500 mt-0.5">
                              +
                              <Price
                                amount={String(price)}
                                currencyCode={currencyCode}
                                className="inline"
                              />
                            </p>
                          )}
                        </div>
                      </div>

                      {node.isUserDefined && isSelected && (
                        <div
                          className="flex items-center rounded-lg border border-neutral-200 dark:border-neutral-700 cursor-pointer"
                          onClick={(e) => e.preventDefault()}
                        >
                          <button
                            type="button"
                            aria-label="Decrease quantity"
                            onClick={(e) => {
                              e.preventDefault();
                              changeQty(pid, -1);
                            }}
                            className="flex h-8 w-8 items-center justify-center cursor-pointer"
                          >
                            <MinusIcon className="h-4 w-4" />
                          </button>
                          <span className="min-w-[2rem] text-center text-sm font-medium">
                            {quantities[pid] || 1}
                          </span>
                          <button
                            type="button"
                            aria-label="Increase quantity"
                            onClick={(e) => {
                              e.preventDefault();
                              changeQty(pid, 1);
                            }}
                            className="flex h-8 w-8 items-center justify-center cursor-pointer"
                          >
                            <PlusIcon className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      <div className="flex items-center justify-between pt-3 border-t border-neutral-200 dark:border-neutral-700">
        <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
          Total
        </span>
        <Price
          amount={String(total)}
          currencyCode={currencyCode}
          className="text-xl font-bold text-neutral-900 dark:text-white"
        />
      </div>
    </div>
  );
}
