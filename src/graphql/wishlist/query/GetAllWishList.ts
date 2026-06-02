import { gql } from "@apollo/client";

export const GET_ALL_WISHLIST = gql`
  query GetAllWishlists(
    $first: Int
    $last: Int
    $after: String
    $before: String
  ) {
    wishlists(first: $first, last: $last, after: $after, before: $before) {
      edges {
        cursor
        node {
          id
          product {
            id
            name
            sku
            urlKey
            price
            minimumPrice
            specialPrice
            type
            shortDescription
            description
            baseImageUrl
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

// Lightweight query used only to resolve the cursor for an arbitrary page
// jump (mirrors the search page's GET_PRODUCTS_PAGINATION two-step approach).
export const GET_WISHLIST_PAGINATION = gql`
  query GetWishlistsPagination($first: Int) {
    wishlists(first: $first) {
      pageInfo {
        endCursor
      }
    }
  }
`;
