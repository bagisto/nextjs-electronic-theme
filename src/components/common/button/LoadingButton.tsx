import clsx from "clsx";
import LoadingDots from "../icons/LoadingDots";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  title: string;
  loading?: boolean;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

export function Button({
  className = "",
  title,
  loading = false,
  disabled = false,
  type,
  ...rest
}: ButtonProps) {
  const buttonClasses = clsx(
    "relative flex w-full text-base md:text-lg cursor-pointer font-archivo font-semibold items-center justify-center rounded-xl bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 px-4 md:px-6 py-3 md:py-3 tracking-wide text-white transition-all duration-200",
    {
      "opacity-50 cursor-wait": loading || disabled,
      "!bg-neutral-400 !cursor-not-allowed": disabled && !loading,
    },
    className
  );

  return (
    <button
      aria-disabled={loading || disabled}
      aria-label={title}
      className={buttonClasses}
      disabled={loading || disabled}
      type={type ?? "reset"}
      {...rest}
    >
      <div className="mx-2 flex items-center justify-center gap-2">
        {loading ? (
          <>
            <LoadingDots className="bg-white" />
            <span>Loading...</span>
          </>
        ) : (
          <span>{title}</span>
        )}
      </div>
    </button>
  );
}
