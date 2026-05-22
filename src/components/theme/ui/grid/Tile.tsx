"use client";

import clsx from "clsx";
import Image from "next/image";
import { useState } from "react";

import Label from "../Label";
import { NOT_IMAGE } from "@/utils/constants";
import { Shimmer } from "@/components/common/Shimmer";

export function GridTileImage({
  active,
  label,
  src,
  alt,
  className,
  ...props
}: {
  isInteractive?: boolean;
  active?: boolean;
  label?: {
    title: string;
    page?: string;
    amount: string;
    currencyCode: string;
    position?: "bottom" | "center" | "left";
  };
} & React.ComponentProps<typeof Image>) {
  const [imgSrc, setImgSrc] = useState<string | undefined>(src as string);
  const [isLoaded, setIsLoaded] = useState(false);

  const loadDone = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setImgSrc(NOT_IMAGE);
    setIsLoaded(true);
  };

  return (
    <div
      className={clsx(
        "group relative flex h-full w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg dark:bg-black",
        active ? "border-2 border-blue-600" : "border-2 border-transparent",
        {
          relative: label,
        }
      )}
    >
      {!isLoaded && (
        <Shimmer
          className="absolute inset-0 z-0"
          width="100%"
          height="100%"
          rounded="lg"
        />
      )}

      <Image
        src={imgSrc || (src as string) || NOT_IMAGE}
        alt={alt ?? ""}
        onError={handleError}
        onLoad={loadDone}
        {...props}
        className={clsx(
          "duration-300 truncate h-full transition group-hover:scale-105 w-full object-cover ease-in-out",
          isLoaded ? "opacity-100" : "opacity-0",
          className
        )}
      />

      {label ? (
        <Label
          amount={label.amount}
          currencyCode={label.currencyCode}
          page={label.page}
          position={label.position}
          title={label.title}
        />
      ) : null}
    </div>
  );
}
