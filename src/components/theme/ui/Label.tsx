import clsx from "clsx";
import { LeftArrow } from "@components/common/icons/LeftArrow";
import { Price } from "./Price";

const Label = ({
  title,
  amount,
  currencyCode,
  page,
  position = "bottom",
}: {
  title: string;
  amount: string;
  page?: string;
  currencyCode: string;
  position?: "bottom" | "center" | "left";
}) => {
  return (
    <div
      className={clsx("absolute z-10 flex w-full px-3", {
        "bottom-4 inset-x-0 justify-center": position === "center" || position === "bottom",
        "bottom-4 left-0 justify-start": position === "left",
      })}
    >
      <div
        className={`flex gap-3 items-center rounded-2xl px-4 py-2 border border-white/20 bg-white/85 text-xs font-semibold text-neutral-900 backdrop-blur-lg dark:border-neutral-700/50 dark:bg-neutral-900/85 dark:text-white shadow-sm max-w-full ${page === "category"
            ? "md:py-2.5 md:px-4 lg:px-5 lg:py-3"
            : "md:py-2.5 md:px-4"
          }`}
      >
        <p
          className={`line-clamp-1 md:line-clamp-2 font-semibold ${clsx(
            page === "category"
              ? "text-sm md:text-base lg:text-lg"
              : "text-xs md:text-sm"
          )}`}
        >
          {title}
        </p>
        {page === "category" ? (
          <button
            aria-label="Go back"
            className="cursor-pointer rounded-full bg-neutral-900 dark:bg-white p-2 transition-all duration-300 hover:translate-x-1"
          >
            <LeftArrow />
          </button>
        ) : (
          <Price
            amount={amount}
            className="flex-none rounded-full bg-neutral-900 dark:bg-white dark:text-neutral-900 px-3 py-1 text-xs text-white font-semibold"
            currencyCode={currencyCode}
          />
        )}
      </div>
    </div>
  );
};

export default Label;
