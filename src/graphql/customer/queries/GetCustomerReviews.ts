import { gql } from "@apollo/client";

export const GET_CUSTOMER_REVIEWS = gql`
  query CustomerReviews($first: Int!) {
    customerReviews(first: $first) {
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
            price
            specialPrice
          }
        }
      }
    }
  }
`;
