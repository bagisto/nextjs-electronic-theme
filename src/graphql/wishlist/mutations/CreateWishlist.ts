import { gql } from "@apollo/client";

export const CREATE_WISHLIST = gql`
  mutation CreateWishlist($input: createWishlistInput!) {
    createWishlist(input: $input) {
      wishlist {
        id
        _id
        product {
          id
          name
          price
          specialPrice
          urlKey
          baseImageUrl
        }
        createdAt
      }
    }
  }
`;
