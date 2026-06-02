"use client";

import { useQuery } from "@apollo/client";
import { GET_CUSTOMER_ORDERS, GET_CUSTOMER_ORDERS_PAGINATION } from "@/graphql/customer/queries/GetCustomerOrders";
import { GET_CUSTOMER_ORDER_ID } from "@/graphql/customer/queries/getCustomerSpecificOrder";
import { GET_CUSTOMER_ORDER_ID_INVOICES } from "@/graphql/customer/queries/GetCustomerOrderInvoices";
import { useAppSelector } from "@/store/hooks";
import { useCursorPagination } from "./useCursorPagination";

interface UseGetOrdersOptions {
    pageSize?: number;
    page?: number;
    after?: string | null;
    before?: string | null;
}

export const useOrders = () => {
    const { user } = useAppSelector((state) => state.user);
    const isLoggedIn = !!user?.email;

    const useGetOrders = (options: UseGetOrdersOptions = {}) => {
        const { pageSize = 10, page = 0, after = null, before = null } = options;

        const { edges, pageInfo, totalCount, loading, error, refetch } = useCursorPagination({
            listQuery: GET_CUSTOMER_ORDERS,
            cursorQuery: GET_CUSTOMER_ORDERS_PAGINATION,
            connectionKey: "customerOrders",
            skip: !isLoggedIn,
            paginate: true,
            pageSize,
            page,
            after,
            before,
        });

        const orders = edges.map((edge: { node: any }) => edge.node);

        return { orders, pageInfo, totalCount, loading, error, refetch };
    };

    const useGetOrderDetails = (orderId: string) => {
        return useQuery(GET_CUSTOMER_ORDER_ID, {
            variables: { id: orderId},
            skip: !orderId || !isLoggedIn,
        });
    };

    const useGetOrderInvoices = (orderId: string, enabled: boolean = true) => {
        const customerOrderId = orderId?.split("/").pop();
        return useQuery(GET_CUSTOMER_ORDER_ID_INVOICES, {
            variables: { orderId: Number(customerOrderId) },
            skip: !orderId || !enabled || !isLoggedIn,
        });
    };

    return {
        useGetOrders,
        useGetOrderDetails,
        useGetOrderInvoices,
        isLoggedIn,
    };
};
