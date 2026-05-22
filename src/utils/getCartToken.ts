import { GUEST_CART_TOKEN, IS_GUEST } from "@/utils/constants";
import { decodeJWT } from "@/utils/jwt-cookie";
import { getNativeCookie } from "./useCookie";


export const getCartToken = (): string | null => {
  const raw = getNativeCookie(GUEST_CART_TOKEN);
  if (!raw) return null;

  const isGuest = getNativeCookie(IS_GUEST) !== "false";

  const decoded = decodeJWT<{ sessionToken: string }>(raw, isGuest);
  return decoded?.sessionToken ?? null;
};


