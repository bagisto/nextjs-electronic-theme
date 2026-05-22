"use client";

import { useQuery } from "@apollo/client";
import { GET_CUSTOMER_ORDERS } from "@/graphql/customer/queries/GetCustomerOrders";
import { GET_CUSTOMER_ORDER_ID } from "@/graphql/customer/queries/getCustomerSpecificOrder";
import { GET_CUSTOMER_ORDER_ID_INVOICES } from "@/graphql/customer/queries/GetCustomerOrderInvoices";
import { useAppSelector } from "@/store/hooks";

export const useOrders = () => {
    const { user } = useAppSelector((state) => state.user);
    const isLoggedIn = !!user?.email;

    const useGetOrders = (first: number = 10) => {
        return useQuery(GET_CUSTOMER_ORDERS, {
            variables: { first },
            skip: !isLoggedIn,
        });
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
