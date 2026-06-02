import { gql } from "@apollo/client";

export const GET_COMPARE_ITEMS = gql`
  query CompareItems(
    $first: Int
    $last: Int
    $after: String
    $before: String
  ) {
    compareItems(first: $first, last: $last, after: $after, before: $before) {
      edges {
        node {
          id
          product {
            id
            type
            name
            urlKey
            shortDescription
            price
            minimumPrice
            specialPrice
            baseImageUrl
            reviews {
              edges {
                node {
                  rating
                }
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
export const GET_COMPARE_ITEMS_PAGINATION = gql`
  query CompareItemsPagination($first: Int) {
    compareItems(first: $first) {
      pageInfo {
        endCursor
      }
    }
  }
`;
