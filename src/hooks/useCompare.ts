import { useMutation, useLazyQuery } from "@apollo/client";
import { useCustomToast } from "./useToast";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import {
    addCompareId,
    removeCompareId,
    setCompareIds,
} from "@/store/slices/compare-slice";
import { normalizeProductId } from "@/utils/productId";
import { GET_COMPARE_ITEMS, GET_COMPARE_ITEMS_PAGINATION } from "@/graphql/catalog/queries/CompareItems";
import { CREATE_COMPARE_ITEM, DELETE_COMPARE_ITEM, DELETE_ALL_COMPARE_ITEMS } from "@/graphql/catalog/mutations/CompareItems";
import { useCursorPagination } from "./useCursorPagination";
import { FULL_LIST_SIZE } from "@/utils/constants";

interface UseCompareOptions {
    /** Enable cursor pagination (off by default so callers like product cards get the full list). */
    paginate?: boolean;
    pageSize?: number;
    page?: number;
    after?: string | null;
    before?: string | null;
    /**
     * Skip loading the compare list (CompareItems). For callers that track
     * per-item state another way — e.g. the PDP, which reads
     * product(id:){ isInCompare }. `isInCompare()`/`getCompareItemId()` then
     * return false/null; use `removeFromCompareByProduct` for removals, which
     * resolves the delete id with a one-off lookup only when needed.
     */
    skipList?: boolean;
}

export const useCompare = (options: UseCompareOptions = {}) => {
    const { showToast } = useCustomToast();
    const { user } = useAppSelector((state) => state.user);
    const compareIds = useAppSelector((state) => state.compare.ids);
    const dispatch = useAppDispatch();
    const isLoggedIn = !!user?.email;

    const { paginate = false, pageSize = 10, page = 0, after = null, before = null, skipList = false } = options;

    const { edges, pageInfo, totalCount, loading, error, refetch } = useCursorPagination({
        listQuery: GET_COMPARE_ITEMS,
        cursorQuery: GET_COMPARE_ITEMS_PAGINATION,
        connectionKey: "compareItems",
        skip: !isLoggedIn || skipList,
        paginate,
        pageSize,
        page,
        after,
        before,
    });

    const [createCompareMutation, { loading: creating }] = useMutation(CREATE_COMPARE_ITEM);
    const [deleteCompareMutation, { loading: deleting }] = useMutation(DELETE_COMPARE_ITEM);
    const [deleteAllCompareMutation, { loading: deletingAll }] = useMutation(DELETE_ALL_COMPARE_ITEMS);

    // On-demand compare-list fetch used only to resolve a delete id when the
    // list isn't kept loaded (skipList). deleteCompareItem needs the compare
    // item id, which the product(id:) query doesn't expose.
    const [fetchCompareItems] = useLazyQuery(GET_COMPARE_ITEMS, {
        fetchPolicy: "network-only",
    });

    const compareItems = edges.map(
        ({ node }: { node: { id: string; product: any } }) => ({
            id: node.id,
            product: node.product
        })
    );

    const isInCompare = (productId: number | string): boolean => {
        if (!isLoggedIn) return false;
        return compareIds.includes(normalizeProductId(productId));
    };

    const getCompareItemId = (productId: number | string): string | null => {
        if (!isLoggedIn || !compareItems.length) return null;
        
        let id = productId;
        if (typeof id === 'string' && isNaN(Number(id))) {
            if (id.includes('/')) {
                id = id.split('/').pop() || id;
            }
        }
        
        const normalizedId = parseInt(id.toString());
        const item = compareItems.find((item: any) => {
            const itemProductId = typeof item.product.id === 'string' 
                ? parseInt(item.product.id.split('/').pop() || item.product.id)
                : item.product.id;
            return itemProductId === normalizedId;
        });
        
        return item ? item.id : null;
    };

    const addToCompare = async (
        productId: number | string,
        options: { skipRefetch?: boolean } = {}
    ) => {
        if (!isLoggedIn) {
            showToast("Please login to add items to comparison", "warning");
            return;
        }

        const numericId = normalizeProductId(productId);
        const result = await createCompareMutation({
            variables: { productId: numericId }
        });

        if (result.data?.createCompareItem?.compareItem) {
            dispatch(addCompareId(numericId));
            showToast("Item added to comparison successfully", "success");
            if (!options.skipRefetch) refetch();
        } else if (result.errors?.length) {
            const message = result.errors[0].message || "Something went wrong";
            if (message.includes("already")) {
                showToast(message, "warning");
            } else {
                showToast(message, "danger");
            }
            throw new Error(message);
        } else {
            showToast("Failed to add item to comparison", "danger");
            throw new Error("Failed to add item to comparison");
        }
    };

    const removeFromCompare = async (
        id: string,
        options: { skipRefetch?: boolean; productId?: number | string } = {}
    ) => {
        if (!isLoggedIn) {
            showToast("Please login to remove items from comparison", "warning");
            return;
        }

        const result = await deleteCompareMutation({
            variables: { id }
        });

        if (result.data?.deleteCompareItem?.compareItem) {
            if (options.productId != null) {
                dispatch(removeCompareId(normalizeProductId(options.productId)));
            }
            showToast("Item removed from comparison successfully", "warning");
            if (!options.skipRefetch) refetch();
        } else if (result.errors?.length) {
            const message = result.errors[0].message || "Failed to remove item";
            showToast(message, "danger");
            throw new Error(message);
        } else {
            showToast("Failed to remove item from comparison", "danger");
            throw new Error("Failed to remove item from comparison");
        }
    };

    // Remove a product from comparison given only its product id. Resolves the
    // compare-item id from the in-memory list when available, otherwise does a
    // single on-demand fetch. Lets the PDP remove items without keeping the
    // whole CompareItems list loaded.
    const removeFromCompareByProduct = async (
        productId: number | string,
        options: { skipRefetch?: boolean } = {}
    ) => {
        if (!isLoggedIn) {
            showToast("Please login to remove items from comparison", "warning");
            return;
        }

        let compareItemId = getCompareItemId(productId);

        if (!compareItemId) {
            const normalizedId = parseInt(
                String(productId).split("/").pop() || String(productId)
            );
            const { data } = await fetchCompareItems({
                variables: { first: FULL_LIST_SIZE },
            });
            const node = (data?.compareItems?.edges || []).find(
                ({ node }: { node: { product: { id: string | number } } }) => {
                    const pid = typeof node.product.id === "string"
                        ? parseInt(node.product.id.split("/").pop() || node.product.id)
                        : node.product.id;
                    return pid === normalizedId;
                }
            )?.node;
            compareItemId = node?.id ?? null;
        }

        if (!compareItemId) {
            showToast("Item not found in comparison", "danger");
            throw new Error("Compare item not found");
        }

        await removeFromCompare(compareItemId, { ...options, productId });
    };


    const toggleCompare = async (
        productId: number | string,
        options: { skipRefetch?: boolean } = {}
    ) => {
        if (!isLoggedIn) {
            showToast("Please login to manage comparison", "warning");
            return;
        }

        const numericId = normalizeProductId(productId);
        const wasIn = compareIds.includes(numericId);

        dispatch(wasIn ? removeCompareId(numericId) : addCompareId(numericId));

        try {
            if (wasIn) {
                await removeFromCompareByProduct(productId, options);
            } else {
                await addToCompare(productId, options);
            }
        } catch (err) {
            dispatch(wasIn ? addCompareId(numericId) : removeCompareId(numericId));
            throw err;
        }
    };

    // Removes every compare item across all pages in a single mutation.
    const removeAllFromCompare = async () => {
        if (!isLoggedIn) return;

        const result = await deleteAllCompareMutation();
        const response = result.data?.createDeleteAllCompareItems?.deleteAllCompareItems;

        if (response) {
            dispatch(setCompareIds([]));
            showToast(response.message || "Comparison list cleared successfully", "warning");
            await refetch();
        } else if (result.errors?.length) {
            showToast(result.errors[0].message || "Failed to clear comparison list", "danger");
            throw new Error(result.errors[0].message);
        } else {
            showToast("Failed to clear comparison list", "danger");
            throw new Error("Failed to clear comparison list");
        }
    };

    return {
        compareItems,
        totalCount,
        pageInfo,
        loading,
        error,
        refetch,
        addToCompare,
        removeFromCompare,
        removeFromCompareByProduct,
        removeAllFromCompare,
        toggleCompare,
        isInCompare,
        creating,
        deleting,
        deletingAll,
    };
};
