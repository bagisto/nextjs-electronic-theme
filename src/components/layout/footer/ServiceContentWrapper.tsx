"use client";

import { usePathname } from "next/navigation";
import ServiceContent, { ServiceContentDataTypes } from "./ServiceContent";

const HIDDEN_PATHS = [
  "/customer/login",
  "/customer/register",
  "/customer/forget-password",
];

export default function ServiceContentWrapper(props: ServiceContentDataTypes) {
  const pathname = usePathname();
  if (HIDDEN_PATHS.includes(pathname)) return null;
  return <ServiceContent {...props} />;
}
