import { useEffect } from "react";
import { useQuery } from "@apollo/client";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { addWishlistId, removeWishlistId } from "@/store/slices/wishlist-slice";
import { addCompareId, removeCompareId } from "@/store/slices/compare-slice";
import { GET_PRODUCT_WISHLIST_COMPARE_STATE } from "@/graphql/catalog/queries/Product";

/** Bagisto returns these flags as "0"/"1" strings; "0" (or empty/null) is false. */
const toBool = (value: unknown): boolean =>
    value === "1" || value === 1 || value === true || value === "true";

const extractId = (productId: string | number) => {
    const last = String(productId).split("/").pop();
    return last && last.length ? last : null;
};

/**
 * Per-product wishlist/compare state for the PDP. Reads the authenticated
 * `product(id:) { isInWishlist isInCompare }` query so first-load state and
 * post-toggle refreshes reflect the logged-in user without pulling the full
 * wishlist/compare lists. Refetch this after a toggle instead of GET_ALL_WISHLIST.
 */
export const useProductWishlistCompareState = (
    productId?: string | number | null
) => {
    const { user } = useAppSelector((state) => state.user);
    const dispatch = useAppDispatch();
    const isLoggedIn = !!user?.email;

    const id = productId != null ? extractId(productId) : null;
    const skip = !isLoggedIn || !id || isNaN(Number(id));

    const { data, loading, refetch } = useQuery(
        GET_PRODUCT_WISHLIST_COMPARE_STATE,
        {
            skip,
            variables: { id },
            fetchPolicy: "cache-and-network",
        }
    );

    const isInWishlist = toBool(data?.product?.isInWishlist);
    const isInCompare = toBool(data?.product?.isInCompare);

    useEffect(() => {
        if (skip || !id || !data?.product) return;
        const numericId = Number(id);
        dispatch(isInWishlist ? addWishlistId(numericId) : removeWishlistId(numericId));
        dispatch(isInCompare ? addCompareId(numericId) : removeCompareId(numericId));
    }, [skip, id, data?.product, isInWishlist, isInCompare, dispatch]);

    return {
        isInWishlist,
        isInCompare,
        loading,
        refetch,
    };
};
