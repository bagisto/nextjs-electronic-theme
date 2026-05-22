"use client";

import dynamic from "next/dynamic";

const ThemeSwitcher = dynamic(() => import("./ThemeSwitch"), {
  ssr: false,
  loading: () => (
    <div
      aria-hidden="true"
      className="size-5  rounded-xl bg-white/5"
    />
  ),
});

export default function ThemeSwitcherWrapper() {
  return <ThemeSwitcher />;
}