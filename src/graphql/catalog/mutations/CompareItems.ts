import { gql } from "@apollo/client";

export const CREATE_COMPARE_ITEM = gql`
  mutation CreateCompareItem($productId: Int!) {
    createCompareItem(input: { productId: $productId }) {
      compareItem {
        product {
          id
          name
          urlKey
          shortDescription
          brand
          price
          specialPrice
          sku
          baseImageUrl
        }
      }
    }
  }
`;

export const DELETE_COMPARE_ITEM = gql`
  mutation DeleteCompareItem($id: ID!) {
    deleteCompareItem(input: { id: $id }) {
      compareItem {
        product {
          id
          sku
          name
          urlKey
          shortDescription
          price
          specialPrice
        }
      }
    }
  }
`;
