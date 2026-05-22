import { gql } from "@apollo/client";

export const GET_COMPARE_ITEMS = gql`
  query CompareItems($first: Int!) {
    compareItems(first: $first) {
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
      totalCount
    }
  }
`;
