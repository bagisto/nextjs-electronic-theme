import { useMutation } from "@apollo/client";
import { useCustomToast } from "./useToast";
import { useAppSelector } from "@/store/hooks";
import { GET_CUSTOMER_ADDRESSES, GET_CUSTOMER_ADDRESSES_PAGINATION } from "@/graphql/customer/queries/GetCustomerAddresses";
import { CREATE_CUSTOMER_ADDRESS } from "@/graphql/customer/mutations/CreateCustomerAddress";
import { DELETE_CUSTOMER_ADDRESS } from "@/graphql/customer/mutations/DeleteCustomerAddress";
import { useCursorPagination } from "./useCursorPagination";

interface UseAddressOptions {
    pageSize?: number;
    page?: number;
    after?: string | null;
    before?: string | null;
}

export const useAddress = (options: UseAddressOptions = {}) => {
    const { showToast } = useCustomToast();
    const { user } = useAppSelector((state) => state.user);
    const isLoggedIn = !!user?.email;

    const { pageSize = 10, page = 0, after = null, before = null } = options;

    const { edges, pageInfo, totalCount, loading, error, refetch } = useCursorPagination({
        listQuery: GET_CUSTOMER_ADDRESSES,
        cursorQuery: GET_CUSTOMER_ADDRESSES_PAGINATION,
        connectionKey: "getCustomerAddresses",
        skip: !isLoggedIn,
        paginate: true,
        pageSize,
        page,
        after,
        before,
        fetchPolicy: "cache-and-network",
    });

    const [createAddressMutation, { loading: creating }] = useMutation(CREATE_CUSTOMER_ADDRESS, {
        onCompleted: (response) => {
            if (response?.createAddUpdateCustomerAddress?.addUpdateCustomerAddress) {
                showToast("Address saved successfully", "success");
                refetch();
            } else {
                showToast("Failed to save address", "danger");
            }
        },
        onError: (err: any) => {
            const message = err?.message || "Something went wrong";
            showToast(message, "danger");
        }
    });

    const [deleteAddressMutation, { loading: deleting }] = useMutation(DELETE_CUSTOMER_ADDRESS, {
        onCompleted: (response) => {
            if (response?.createDeleteCustomerAddress?.deleteCustomerAddress) {
                showToast("Address deleted successfully", "success");
                refetch();
            } else {
                showToast("Failed to delete address", "danger");
            }
        },
        onError: (err: any) => {
            const message = err?.message || "Something went wrong";
            showToast(message, "danger");
        }
    });

    const addresses = edges.map((edge: { node: any }) => edge.node);

    const createAddress = async (input: any, addressId?: string) => {
        if (!isLoggedIn) {
            showToast("Please login to add addresses", "warning");
            return;
        }
        const { useForShipping: _useForShipping, ...addressInput } = input ?? {};
        try {
            await createAddressMutation({
                variables: {
                    input: {
                        ...addressInput,
                        addressId: addressId ? parseInt(addressId) : undefined,
                    }
                }
            });
        } catch (e) {
            console.error(e, "error");
        }
    };

    const deleteAddress = async (addressId: string) => {
        if (!isLoggedIn) {
            showToast("Please login to delete addresses", "warning");
            return;
        }

        try {
            await deleteAddressMutation({
                variables: {
                    input: {
                        addressId: Number(addressId)
                    }
                }
            });
        } catch (e) {
            console.error(e, "error");
        }
    };

    return {
        addresses,
        totalCount,
        pageInfo,
        loading,
        error,
        refetch,
        createAddress,
        deleteAddress,
        creating,
        deleting,
    };
};
