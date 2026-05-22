import { gql } from "@apollo/client";

export const GET_ALL_WISHLIST = gql`
 query GetAllWishlists {
    wishlists {
      edges {
        node {
          id
          product {
            id
            name
            sku
            urlKey
            price
            specialPrice
            type
            shortDescription
            description
            baseImageUrl
          }
        }
      }
      totalCount
    }
  }
`;