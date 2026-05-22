import { gql } from "@apollo/client";

export const GET_CUSTOMER_ORDERS = gql`
  query GetCustomerOrders($first: Int!) {
    customerOrders(first: $first) {
        edges {
            node {
                id
                createdAt
                subTotal
                incrementId
                status
                grandTotal
            }
        }
    }
}
`;
