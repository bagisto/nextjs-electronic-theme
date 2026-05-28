import { useQuery, useMutation } from "@apollo/client";
import { useCustomToast } from "./useToast";
import { useAppSelector } from "@/store/hooks";
import { GET_COMPARE_ITEMS } from "@/graphql/catalog/queries/CompareItems";
import { CREATE_COMPARE_ITEM, DELETE_COMPARE_ITEM } from "@/graphql/catalog/mutations/CompareItems";

export const useCompare = () => {
    const { showToast } = useCustomToast();
    const { user } = useAppSelector((state) => state.user);
    const isLoggedIn = !!user?.email;

    const { data: compareData, loading, error, refetch } = useQuery(GET_COMPARE_ITEMS, {
        skip: !isLoggedIn,
    });

    const [createCompareMutation, { loading: creating }] = useMutation(CREATE_COMPARE_ITEM);
    const [deleteCompareMutation, { loading: deleting }] = useMutation(DELETE_COMPARE_ITEM);

    const compareItems = compareData?.compareItems?.edges?.map(
        ({ node }: { node: { id: string; product: any } }) => ({
            id: node.id,
            product: node.product
        })
    ) || [];

    const isInCompare = (productId: number | string): boolean => {
        if (!isLoggedIn || !compareItems.length) return false;
        
        let id = productId;
        if (typeof id === 'string' && isNaN(Number(id))) {
            if (id.includes('/')) {
                id = id.split('/').pop() || id;
            }
        }
        
        const normalizedId = parseInt(id.toString());
        return compareItems.some((item: any) => {
            const itemProductId = typeof item.product.id === 'string' 
                ? parseInt(item.product.id.split('/').pop() || item.product.id)
                : item.product.id;
            return itemProductId === normalizedId;
        });
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

    const addToCompare = async (productId: number | string) => {
        if (!isLoggedIn) {
            showToast("Please login to add items to comparison", "warning");
            return;
        }

        let id = productId;
        if (typeof id === 'string' && isNaN(Number(id))) {
            if (id.includes('/')) {
                id = id.split('/').pop() || id;
            }
        }

        const result = await createCompareMutation({
            variables: { productId: parseInt(id.toString()) }
        });

        if (result.data?.createCompareItem?.compareItem) {
            showToast("Item added to comparison successfully", "success");
            refetch();
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

    const removeFromCompare = async (id: string) => {
        if (!isLoggedIn) {
            showToast("Please login to remove items from comparison", "warning");
            return;
        }

        const result = await deleteCompareMutation({
            variables: { id }
        });

        if (result.data?.deleteCompareItem?.compareItem) {
            showToast("Item removed from comparison successfully", "success");
            refetch();
        } else if (result.errors?.length) {
            const message = result.errors[0].message || "Failed to remove item";
            showToast(message, "danger");
            throw new Error(message);
        } else {
            showToast("Failed to remove item from comparison", "danger");
            throw new Error("Failed to remove item from comparison");
        }
    };

    const toggleCompare = async (productId: number | string) => {
        if (!isLoggedIn) {
            showToast("Please login to manage comparison", "warning");
            return;
        }

        const compareItemId = getCompareItemId(productId);
        
        if (compareItemId) {
            await removeFromCompare(compareItemId);
        } else {
            await addToCompare(productId);
        }
    };

    return {
        compareItems,
        loading,
        error,
        refetch,
        addToCompare,
        removeFromCompare,
        toggleCompare,
        isInCompare,
        creating,
        deleting,
    };
};
