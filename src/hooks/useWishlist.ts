import { useQuery, useMutation } from "@apollo/client";
import { useCustomToast } from "./useToast";
import { useAppSelector } from "@/store/hooks";
import { GET_ALL_WISHLIST, GET_WISHLIST_PAGINATION } from "@/graphql/wishlist/query/GetAllWishList";
import { CREATE_WISHLIST } from "@/graphql/wishlist/mutations/CreateWishlist";
import { DELETE_WISHLIST } from "@/graphql/wishlist/mutations/DeleteWishlist";
import { DELETE_ALL_WISHLISTS } from "@/graphql/wishlist/mutations/DeleteAllWishlists";
import { MOVE_WISHLIST_TO_CART } from "@/graphql/wishlist/mutations/MoveToCart";
import { useCartDetail } from "./useCartDetail";

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
}

export const useWishlist = (options: UseWishlistOptions = {}) => {
    const { showToast } = useCustomToast();
    const { user } = useAppSelector((state) => state.user);
    const { getCartDetail } = useCartDetail();
    const isLoggedIn = !!user?.email;

    const { paginate = false, pageSize = 10, page = 0, after = null, before = null } = options;

    // For an arbitrary (non-adjacent) page jump the URL carries neither cursor,
    // so we first resolve the end cursor of all preceding items, then fetch the
    // target page. Mirrors the search page's two-step pagination pattern.
    const needsCursorLookup = paginate && page > 0 && !after && !before;
    const { data: prelimData, loading: prelimLoading } = useQuery(GET_WISHLIST_PAGINATION, {
        skip: !isLoggedIn || !needsCursorLookup,
        variables: { first: page * pageSize },
    });
    const resolvedAfter = needsCursorLookup
        ? (prelimData?.wishlists?.pageInfo?.endCursor ?? null)
        : after;

    const variables = paginate
        ? before
            ? { last: pageSize, before }
            : { first: pageSize, after: resolvedAfter }
        : {};

    // Wait for the cursor lookup to resolve before fetching the target page,
    // otherwise we'd briefly request page 1 with a null cursor.
    const waitingForCursor = needsCursorLookup && resolvedAfter === null && prelimLoading;

    const { data: wishlistData, loading: listLoading, error, refetch } = useQuery(GET_ALL_WISHLIST, {
        skip: !isLoggedIn || waitingForCursor,
        variables,
    });

    const loading = listLoading || waitingForCursor;

    const [createWishlistMutation, { loading: creating }] = useMutation(CREATE_WISHLIST);
    const [deleteWishlistMutation, { loading: deleting }] = useMutation(DELETE_WISHLIST);
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
        if (!isLoggedIn || !wishlistItems.length) return false;
        
        let id = productId;
        if (typeof id === 'string' && isNaN(Number(id))) {
            if (id.includes('/')) {
                id = id.split('/').pop() || id;
            }
        }
        
        const normalizedId = parseInt(id.toString());
        return wishlistItems.some((item: any) => {
            const itemProductId = typeof item.product.id === 'string' 
                ? parseInt(item.product.id.split('/').pop() || item.product.id)
                : item.product.id;
            return itemProductId === normalizedId;
        });
    };

    const getWishlistItemId = (productId: number | string): string | null => {
        if (!isLoggedIn || !wishlistItems.length) return null;
        
        let id = productId;
        if (typeof id === 'string' && isNaN(Number(id))) {
            if (id.includes('/')) {
                id = id.split('/').pop() || id;
            }
        }
        
        const normalizedId = parseInt(id.toString());
        const item = wishlistItems.find((item: any) => {
            const itemProductId = typeof item.product.id === 'string' 
                ? parseInt(item.product.id.split('/').pop() || item.product.id)
                : item.product.id;
            return itemProductId === normalizedId;
        });
        
        return item ? item.id : null;
    };

    const addToWishlist = async (productId: number | string) => {
        if (!isLoggedIn) {
            showToast("Please login to add items to wishlist", "warning");
            return;
        }

        let id = productId;
        if (typeof id === 'string' && isNaN(Number(id))) {
            if (id.includes('/')) {
                id = id.split('/').pop() || id;
            }
        }

        const result = await createWishlistMutation({
            variables: { input: { productId: parseInt(id.toString()) } }
        });

        if (result.data?.createWishlist?.wishlist) {
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

    const removeFromWishlist = async (id: string) => {
        if (!isLoggedIn) return;

        const result = await deleteWishlistMutation({
            variables: { input: { id } }
        });

        if (result.data?.deleteWishlist?.wishlist) {
            showToast("Item removed from wishlist successfully", "success");
            refetch();
        } else if (result.errors?.length) {
            const message = result.errors[0].message;
            if (message === "Item Successfully Removed From Wishlist") {
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

    const toggleWishlist = async (productId: number | string) => {
        if (!isLoggedIn) {
            showToast("Please login to manage wishlist", "warning");
            return;
        }

        const wishlistItemId = getWishlistItemId(productId);
        
        if (wishlistItemId) {
            await removeFromWishlist(wishlistItemId);
        } else {
            await addToWishlist(productId);
        }
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
            showToast(response.message || "Wishlist cleared successfully", "success");
            await refetch();
        } else if (result.errors?.length) {
            showToast(result.errors[0].message || "Failed to clear wishlist", "danger");
            throw new Error(result.errors[0].message);
        } else {
            showToast("Failed to clear wishlist", "danger");
            throw new Error("Failed to clear wishlist");
        }
    };

    const moveItemToCart = async (wishlistItemId: number | string, quantity: number) => {
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
        toggling: creating || deleting,
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

