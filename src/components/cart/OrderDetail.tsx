"use client";

import { ORDER_ID } from "@/utils/constants";
import { deleteCookie, getCookie } from "@utils/useCookie";
import { useEffect, useState } from "react";

export default function OrderDetail({ orderId: initialOrderId }: { orderId?: string }) {
  const [orderId, setOrderId] = useState<string | null>(initialOrderId ?? null);

  useEffect(() => {
    if (!initialOrderId) {
      setOrderId(getCookie(ORDER_ID));
    }
    deleteCookie(ORDER_ID);
  }, [initialOrderId]);

  return (
    <div className="mb-8 font-archivo">
      <h1 className="my-2 text-center text-2xl md:text-3xl font-semibold">
        Your order{" "}
        <span className="text-primary">
          #{orderId ? orderId : <span className="animate-pulse">...</span>}
        </span>{" "}
        has been placed successfully{" "}
      </h1>
      <p className="text-center text-sm md:text-lg font-normal text-black/60 dark:text-neutral-300">
        Missing page, but your next favorite chair is just a click away.
      </p>
    </div>
  );
}
