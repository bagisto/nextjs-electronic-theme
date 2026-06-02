import { gql } from "@apollo/client";

export const GET_CUSTOMER_REVIEWS = gql`
  query CustomerReviews(
    $first: Int
    $last: Int
    $after: String
    $before: String
  ) {
    customerReviews(first: $first, last: $last, after: $after, before: $before) {
      edges {
        node {
          name
          title
          rating
          comment
          createdAt
          product {
            baseImageUrl
            name
            urlKey
            price
            specialPrice
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
export const GET_CUSTOMER_REVIEWS_PAGINATION = gql`
  query CustomerReviewsPagination($first: Int) {
    customerReviews(first: $first) {
      pageInfo {
        endCursor
      }
    }
  }
`;
