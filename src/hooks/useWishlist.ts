import { useQuery, useMutation } from "@apollo/client";
import { useCustomToast } from "./useToast";
import { useAppSelector } from "@/store/hooks";
import { GET_ALL_WISHLIST } from "@/graphql/wishlist/query/GetAllWishList";
import { CREATE_WISHLIST } from "@/graphql/wishlist/mutations/CreateWishlist";
import { DELETE_WISHLIST } from "@/graphql/wishlist/mutations/DeleteWishlist";
import { MOVE_WISHLIST_TO_CART } from "@/graphql/wishlist/mutations/MoveToCart";
import { useCartDetail } from "./useCartDetail";

export const useWishlist = () => {
    const { showToast } = useCustomToast();
    const { user } = useAppSelector((state) => state.user);
    const { getCartDetail } = useCartDetail();
    const isLoggedIn = !!user?.email;

    const { data: wishlistData, loading, error, refetch } = useQuery(GET_ALL_WISHLIST, {
        skip: !isLoggedIn,
    });

    const [createWishlistMutation, { loading: creating }] = useMutation(CREATE_WISHLIST);
    const [deleteWishlistMutation, { loading: deleting }] = useMutation(DELETE_WISHLIST);

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
        loading,
        error,
        creating,
        deleting,
        toggling: creating || deleting,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        isInWishlist,
        getWishlistId,
        refetch,
        moveItemToCart,
        movingToCart,
    };
};

