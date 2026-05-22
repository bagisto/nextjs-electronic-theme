import { gql } from "@apollo/client";

export const DELETE_WISHLIST = gql`
  mutation DeleteWishlist($input: deleteWishlistInput!) {
    deleteWishlist(input: $input) {
      wishlist {
        id
        _id
        product {
          id
          name
          price
        }
      }
    }
  }
`;
