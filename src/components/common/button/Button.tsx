import clsx from "clsx";

import LoadingDots from '@/components/common/icons/LoadingDots';

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
    "relative flex w-full text-lg cursor-pointer font-archivo font-semibold items-center justify-center bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 p-3 tracking-wide text-white transition-all duration-200",
    "hover:opacity-90",
    "rounded-[100px] md:rounded-xl",
    {
      "opacity-50 cursor-wait ": loading || disabled,
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
            <span>loading</span>
          </>
        ) : (
          <span>{title}</span>
        )}
      </div>
    </button>
  );
}
