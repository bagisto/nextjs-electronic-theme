"use client";

import { FC } from "react";
import { VisuallyHidden } from "@react-aria/visually-hidden";
import { SwitchProps, useSwitch } from "@heroui/switch";
import { useTheme } from "next-themes";
import clsx from "clsx";
import { MoonFilledIcon, SunFilledIcon } from "@/components/common/icons/product-icons";



export interface ThemeSwitchProps {
  className?: string;
  classNames?: SwitchProps["classNames"];
}

const ThemeSwitch: FC<ThemeSwitchProps> = ({ className, classNames }) => {
  const { setTheme, resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const onChange = () => {
    setTheme(isDark ? "light" : "dark");
  };

  const {
    Component,
    slots,
    getBaseProps,
    getInputProps,
    getWrapperProps,
  } = useSwitch({
    isSelected: isDark,
    "aria-label": `Switch to ${isDark ? "light" : "dark"} mode`,
    onChange,
  });

  return (
    <Component
      {...getBaseProps({
        className: clsx(
          "flex size-9 lg:size-10 cursor-pointer items-center justify-center rounded-xl transition-all duration-300",
          "outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 data-[focus-visible=true]:outline-none data-[focus-visible=true]:ring-0",
          className,
          classNames?.base
        ),
      })}
    >
      <VisuallyHidden>
        <input {...getInputProps()} />
      </VisuallyHidden>

      <div
        {...getWrapperProps()}
        className={slots.wrapper({
          class: clsx(
            [
              "mx-0 h-auto w-auto bg-transparent px-0",
              "flex items-center justify-center",
              "transition-transform duration-500 ease-in-out",
              isDark ? "rotate-0" : "rotate-[360deg]",
            ],
            classNames?.wrapper
          ),
        })}
      >
        {isDark ? (
          <SunFilledIcon size={20} className="text-white hover:text-neutral-200 transition-colors" />
        ) : (
          <MoonFilledIcon size={20} className="text-white hover:text-neutral-200 transition-colors" />
        )}
      </div>
    </Component>
  );
};

export default ThemeSwitch;
