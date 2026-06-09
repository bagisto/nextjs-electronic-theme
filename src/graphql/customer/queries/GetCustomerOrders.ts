import { gql } from "@apollo/client";

export const GET_CUSTOMER_ORDERS = gql`
  query GetCustomerOrders(
    $first: Int
    $last: Int
    $after: String
    $before: String
  ) {
    customerOrders(first: $first, last: $last, after: $after, before: $before) {
      edges {
        node {
          id
          createdAt
          subTotal
          incrementId
          status
          grandTotal
          payment {
            methodTitle
          }
          items {
            edges {
              node {
                id
                qtyOrdered
              }
            }
          }
        }
      }
      pageInfo {
        startCursor
        endCursor
        hasNextPage
        hasPreviousPage
      }
      totalCount
    }
  }
`;

// Lightweight query used to resolve the cursor for an arbitrary page jump.
export const GET_CUSTOMER_ORDERS_PAGINATION = gql`
  query GetCustomerOrdersPagination($first: Int) {
    customerOrders(first: $first) {
      pageInfo {
        endCursor
      }
    }
  }
`;
