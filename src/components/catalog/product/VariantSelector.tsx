"use client";

import { AttributeData, AttributeOptionNode } from "@/types/types";
import { createUrl, getValidTitle } from "@/utils/helper";
import clsx from "clsx";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function VariantSelector({
  variants,
  setUserInteracted,
}: {
  variants: AttributeData[];
  setUserInteracted: React.Dispatch<React.SetStateAction<boolean>>;
  possibleOptions: Record<string, number[]>;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  if (!variants?.length) return null;

  // Check if attribute is color (code contains 'color')
  const isColorAttribute = (code: string) => {
    return code.toLowerCase().includes('color') || code.toLowerCase().includes('colour');
  };

  return (
    <>
      {variants.map((option , index : number) => {
        const attributeCode = option.code;
        const _isAlreadySelected = searchParams.has(attributeCode);
        const isColor = isColorAttribute(attributeCode);

        return (
          <dl key={`${option.id}-${index}`} className="mb-6">
            <dt className="mb-3 text-sm font-medium capitalize tracking-wide text-neutral-700 dark:text-neutral-300">
              {getValidTitle(attributeCode)}
              {searchParams.get(attributeCode) && (
                <span className="ml-2 text-neutral-500">
                 : {searchParams.get(attributeCode)}
                </span>
              )}
            </dt>

            <dd className="flex flex-wrap gap-2">
              {(option.options as AttributeOptionNode[]).map((node) => {
                const isActive = searchParams.get(attributeCode) === String(node.id);
                const isAvailable = node?.isValid;
                const nextParams = new URLSearchParams(searchParams.toString());
                nextParams.set(attributeCode, String(node.id));

                const optionUrl = createUrl(pathname, nextParams);

                // Color swatch style - detect from adminName (hex color or color name)
                if (isColor && node.adminName) {
                  const colorValue = node.adminName.trim();
                  // Check if it looks like a hex color
                  const isHexColor = /^#([0-9A-F]{3}){1,2}$/i.test(colorValue);

                  return (
                    <button
                      key={node.id}
                      disabled={!isAvailable}
                      onClick={() => {
                        if (!isAvailable) return;
                        router.replace(optionUrl, { scroll: false });
                        setUserInteracted(true);
                      }}
                      className={clsx(
                        "relative h-8 w-8 rounded-full overflow-hidden border-2 transition-all duration-200",
                        {
                          "border-neutral-900 dark:border-white ring-2 ring-neutral-900 dark:ring-white": isActive,
                          "border-transparent hover:border-neutral-400 dark:hover:border-neutral-500": !isActive && isAvailable,
                          "cursor-not-allowed opacity-50": !isAvailable,
                          "cursor-pointer": isAvailable,
                        }
                      )}
                      style={isHexColor ? { backgroundColor: colorValue } : {}}
                      title={node.label || node.adminName}
                    >
                      {!isHexColor && (
                        <span className="flex items-center justify-center h-full text-[10px] font-bold text-neutral-600 dark:text-neutral-300 uppercase">
                          {(node.label || colorValue || "").charAt(0)}
                        </span>
                      )}
                    </button>
                  );
                }

                // Default button style (for sizes, etc.)
                return (
                  <button
                    key={node.id}
                    disabled={!isAvailable}
                    onClick={() => {
                      if (!isAvailable) return;
                      router.replace(optionUrl, { scroll: false });
                      setUserInteracted(true);
                    }}
                    className={clsx(
                      "flex min-w-[40px] h-9 cursor-pointer items-center justify-center rounded-full bg-neutral-100 px-4 text-sm font-medium dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 border border-neutral-200",
                      {
                        "cursor-default ring-2 ring-green-500 border-green-500 text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/30": isActive,
                        "ring-[0] transition duration-200 hover:scale-105 hover:border-neutral-900 dark:hover:border-white":
                          !isActive && isAvailable,
                        "relative z-10 cursor-not-allowed overflow-hidden bg-neutral-100 text-neutral-400 line-through border-neutral-200":
                          !isAvailable,
                      }
                    )}
                  >
                    {node.label || node.adminName}
                  </button>
                );
              })}
            </dd>
          </dl>
        );
      })}
    </>
  );
}
