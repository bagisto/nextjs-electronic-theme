import { gql } from "@apollo/client";

export const GET_CUSTOMER_ADDRESSES = gql`
  query GetCustomerAddresses($first: Int!) {
    getCustomerAddresses(first: $first) {
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
          useForShipping
        }
      }
    }
  }
`;
