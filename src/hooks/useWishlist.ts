import { useQuery, useMutation, useLazyQuery } from "@apollo/client";
import { useCustomToast } from "./useToast";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import {
    addWishlistId,
    removeWishlistId,
    setWishlistIds,
} from "@/store/slices/wishlist-slice";
import { normalizeProductId } from "@/utils/productId";
import { GET_ALL_WISHLIST, GET_WISHLIST_PAGINATION } from "@/graphql/wishlist/query/GetAllWishList";
import { GET_PRODUCT_WISHLIST_COMPARE_STATE } from "@/graphql/catalog/queries/Product";
import { CREATE_WISHLIST } from "@/graphql/wishlist/mutations/CreateWishlist";
import { DELETE_WISHLIST } from "@/graphql/wishlist/mutations/DeleteWishlist";
import { TOGGLE_WISHLIST } from "@/graphql/wishlist/mutations/ToggleWishlist";
import { DELETE_ALL_WISHLISTS } from "@/graphql/wishlist/mutations/DeleteAllWishlists";
import { MOVE_WISHLIST_TO_CART } from "@/graphql/wishlist/mutations/MoveToCart";
import { useCartDetail } from "./useCartDetail";
import { FULL_LIST_SIZE } from "@/utils/constants";

interface UseWishlistOptions {
    /** Enable cursor-based pagination for the wishlist listing. */
    paginate?: boolean;
    /** Number of items per page. */
    pageSize?: number;
    /** Zero-based current page index (derived from the URL `page` param). */
    page?: number;
    /** Forward cursor (the `cursor`/`endCursor` URL param). */
    after?: string | null;
    /** Backward cursor (the `before`/`startCursor` URL param). */
    before?: string | null;
    skipList?: boolean;
}

export const useWishlist = (options: UseWishlistOptions = {}) => {
    const { showToast } = useCustomToast();
    const { user } = useAppSelector((state) => state.user);
    const wishlistIds = useAppSelector((state) => state.wishlist.ids);
    const dispatch = useAppDispatch();
    const { getCartDetail } = useCartDetail();
    const isLoggedIn = !!user?.email;

    const { paginate = false, pageSize = 10, page = 0, after = null, before = null, skipList = false } = options;

    // For an arbitrary (non-adjacent) page jump the URL carries neither cursor,
    // so we first resolve the end cursor of all preceding items, then fetch the
    // target page. Mirrors the search page's two-step pagination pattern.
    const needsCursorLookup = paginate && page > 0 && !after && !before;
    const { data: prelimData, loading: prelimLoading } = useQuery(GET_WISHLIST_PAGINATION, {
        skip: !isLoggedIn || !needsCursorLookup || skipList,
        variables: { first: page * pageSize },
    });
    const resolvedAfter = needsCursorLookup
        ? (prelimData?.wishlists?.pageInfo?.endCursor ?? null)
        : after;
    const variables = paginate
        ? before
            ? { last: pageSize, before }
            : { first: pageSize, after: resolvedAfter }
        : { first: FULL_LIST_SIZE };

    // Wait for the cursor lookup to resolve before fetching the target page,
    // otherwise we'd briefly request page 1 with a null cursor.
    const waitingForCursor = needsCursorLookup && resolvedAfter === null && prelimLoading;

    const { data: wishlistData, loading: listLoading, error, refetch } = useQuery(GET_ALL_WISHLIST, {
        skip: !isLoggedIn || waitingForCursor || skipList,
        variables,
    });

    const loading = listLoading || waitingForCursor;

    const [createWishlistMutation, { loading: creating }] = useMutation(CREATE_WISHLIST);
    const [deleteWishlistMutation, { loading: deleting }] = useMutation(DELETE_WISHLIST);
    const [toggleWishlistMutation, { loading: toggling }] = useMutation(TOGGLE_WISHLIST);
    const [fetchProductState] = useLazyQuery(GET_PRODUCT_WISHLIST_COMPARE_STATE, {
        fetchPolicy: "network-only",
    });
    const [deleteAllWishlistsMutation, { loading: deletingAll }] = useMutation(DELETE_ALL_WISHLISTS);

    const [moveWishlistToCartMutation, { loading: movingToCart }] = useMutation(MOVE_WISHLIST_TO_CART, {
        onCompleted: (response) => {
            const result = response?.moveWishlistToCart?.wishlistToCart;
            if (result) {
                showToast(result.message || "Item moved to cart successfully", "success");
                refetch();
                getCartDetail();
            } else {
                showToast("Failed to move item to cart", "danger");
            }
        },
        onError: (err: any) => {
            showToast(err?.message || "Failed to move item to cart", "danger");
        }
    });

    const wishlistItems = wishlistData?.wishlists?.edges?.map((edge: any) => edge.node) || [];
    const totalCount = wishlistData?.wishlists?.totalCount || 0;
    const pageInfo = wishlistData?.wishlists?.pageInfo ?? null;

    const isInWishlist = (productId: number | string): boolean => {
        if (!isLoggedIn) return false;
        return wishlistIds.includes(normalizeProductId(productId));
    };

    const addToWishlist = async (productId: number | string) => {
        if (!isLoggedIn) {
            showToast("Please login to add items to wishlist", "warning");
            return;
        }

        const numericId = normalizeProductId(productId);
        const result = await createWishlistMutation({
            variables: { input: { productId: numericId } }
        });

        if (result.data?.createWishlist?.wishlist) {
            dispatch(addWishlistId(numericId));
            showToast("Item added to wishlist successfully", "success");
            refetch();
        } else if (result.errors?.length) {
            showToast(result.errors[0].message || "Failed to add item to wishlist", "danger");
            throw new Error(result.errors[0].message);
        } else {
            showToast("Failed to add item to wishlist", "danger");
            throw new Error("Failed to add item to wishlist");
        }
    };

    const removeFromWishlist = async (id: string, productId?: number | string) => {
        if (!isLoggedIn) return;

        const syncRemoved = () => {
            if (productId != null) dispatch(removeWishlistId(normalizeProductId(productId)));
        };

        const result = await deleteWishlistMutation({
            variables: { input: { id } }
        });

        if (result.data?.deleteWishlist?.wishlist) {
            syncRemoved();
            showToast("Item removed from wishlist successfully", "warning");
            refetch();
        } else if (result.errors?.length) {
            const message = result.errors[0].message;
            if (message === "Item Successfully Removed From Wishlist") {
                syncRemoved();
                showToast(message, "warning");
                refetch();
            } else {
                showToast(message || "Failed to remove item", "danger");
                throw new Error(message);
            }
        } else {
            showToast("Failed to remove item from wishlist", "danger");
            throw new Error("Failed to remove item from wishlist");
        }
    };

    const toggleWishlist = async (
        productId: number | string,
        options: { skipRefetch?: boolean; refetchState?: () => Promise<any> } = {}
    ) => {
        if (!isLoggedIn) {
            showToast("Please login to manage wishlist", "warning");
            return;
        }

        const numericId = normalizeProductId(productId);

        const wasIn = wishlistIds.includes(numericId);
        dispatch(wasIn ? removeWishlistId(numericId) : addWishlistId(numericId));

        let result;
        try {
            result = await toggleWishlistMutation({
                variables: { input: { productId: numericId } },
                errorPolicy: "all"
            });
        } catch (err) {
            dispatch(wasIn ? addWishlistId(numericId) : removeWishlistId(numericId));
            throw err;
        }

        const refreshProductState = async () => {
            if (options.refetchState) {
                try {
                    await options.refetchState();
                } catch (e) {
                    console.error("Failed to refetch product state directly:", e);
                    await fetchProductState({ variables: { id: numericId.toString() } });
                }
            } else {
                await fetchProductState({ variables: { id: numericId.toString() } });
            }
        };

        const isRemoved = result.errors?.some(err => err.message === "Item Successfully Removed From Wishlist");
        const isAdded = !!(result.data?.toggleWishlist?.wishlist || result.data?.ToggleWishlist?.wishlist);

        if (isRemoved || isAdded) {
            dispatch(isAdded ? addWishlistId(numericId) : removeWishlistId(numericId));
            if (isRemoved) {
                showToast("Item Successfully Removed From Wishlist", "warning");
            } else {
                showToast("Item added to wishlist successfully", "success");
            }

            await refreshProductState();
            if (!options.skipRefetch) refetch();
            return { isAdded, isRemoved };
        }

        dispatch(wasIn ? addWishlistId(numericId) : removeWishlistId(numericId));
        const errMsg = result.errors?.[0]?.message || "Failed to update wishlist";
        showToast(errMsg, "danger");
        throw new Error(errMsg);
    };

    const getWishlistId = (productId: string) => {
        const item = productId.split('/').pop();
        return item;
    }

    // Removes every wishlist item across all pages in a single mutation.
    const removeAllFromWishlist = async () => {
        if (!isLoggedIn) return;

        const result = await deleteAllWishlistsMutation();
        const response = result.data?.createDeleteAllWishlists?.deleteAllWishlists;

        if (response) {
            dispatch(setWishlistIds([]));
            showToast(response.message || "Wishlist cleared successfully", "warning");
            await refetch();
        } else if (result.errors?.length) {
            showToast(result.errors[0].message || "Failed to clear wishlist", "danger");
            throw new Error(result.errors[0].message);
        } else {
            showToast("Failed to clear wishlist", "danger");
            throw new Error("Failed to clear wishlist");
        }
    };

    const moveItemToCart = async (
        wishlistItemId: number | string,
        quantity: number,
        productId?: number | string
    ) => {
        if (!isLoggedIn) return;
        try {
            await moveWishlistToCartMutation({
                variables: {
                    input: {
                        wishlistItemId: parseInt(wishlistItemId.toString()),
                        quantity
                    }
                }
            });
            if (productId != null) dispatch(removeWishlistId(normalizeProductId(productId)));
        } catch (e) {
            console.error(e, "error");
        }
    };

    return {
        wishlistItems,
        totalCount,
        pageInfo,
        loading,
        error,
        creating,
        deleting,
        deletingAll,
        toggling,
        addToWishlist,
        removeFromWishlist,
        removeAllFromWishlist,
        toggleWishlist,
        isInWishlist,
        getWishlistId,
        refetch,
        moveItemToCart,
        movingToCart,
    };
};

