import { gql } from "@apollo/client";

export const GET_CUSTOMER_ORDER_ID_INVOICES = gql`
query CustomerInvoices($orderId: Int!) {
    customerInvoices(orderId: $orderId) {
        edges {
            node {
                id
                incrementId 
            }
        }
    }
}
`;