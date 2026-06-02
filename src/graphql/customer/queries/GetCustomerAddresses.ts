import { gql } from "@apollo/client";

export const GET_CUSTOMER_ADDRESSES = gql`
  query GetCustomerAddresses(
    $first: Int
    $last: Int
    $after: String
    $before: String
  ) {
    getCustomerAddresses(first: $first, last: $last, after: $after, before: $before) {
      totalCount
      edges {
        node {
          addressType
          firstName
          lastName
          id
          companyName
          address
          city
          state
          country
          postcode
          phone
          email
          name
          defaultAddress
        }
      }
      pageInfo {
        startCursor
        endCursor
        hasNextPage
        hasPreviousPage
      }
    }
  }
`;

// Lightweight query used to resolve the cursor for an arbitrary page jump.
export const GET_CUSTOMER_ADDRESSES_PAGINATION = gql`
  query GetCustomerAddressesPagination($first: Int) {
    getCustomerAddresses(first: $first) {
      pageInfo {
        endCursor
      }
    }
  }
`;
