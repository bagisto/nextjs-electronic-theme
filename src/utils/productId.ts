/**
 * Normalise a product id coming from GraphQL (which may be a plain number,
 * a numeric string, or an opaque global id like `gid://.../123`) into the
 * numeric id used everywhere for membership comparisons.
 */
export const normalizeProductId = (productId: number | string): number => {
  let id: number | string = productId;
  if (typeof id === "string" && id.includes("/")) {
    id = id.split("/").pop() || id;
  }
  return parseInt(id.toString(), 10);
};
