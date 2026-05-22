
import { FC, ComponentProps } from "react";
import clsx from "clsx";

interface SocialButtonProps extends ComponentProps<"button"> {
  label: string;
}

export const SocialButton: FC<SocialButtonProps> = ({
  className,
  label,
  children,
  ...props
}) => {
  return (
    <button
      className={clsx(
        "w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-colors",
        className
      )}
      aria-label={label}
      {...props}
    >
      {children}
    </button>
  );
};
