import { useEffect } from "react";

export function useBodyScrollLock(isLocked: boolean) {
  useEffect(() => {
    if (!isLocked) return;
    document.body.classList.add("scroll-locked");
    document.documentElement.classList.add("scroll-locked");
    return () => {
      document.body.classList.remove("scroll-locked");
      document.documentElement.classList.remove("scroll-locked");
    };
  }, [isLocked]);
}
