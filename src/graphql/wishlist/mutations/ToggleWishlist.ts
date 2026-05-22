import { gql } from "@apollo/client";

export const TOGGLE_WISHLIST = gql`
  mutation ToggleWishlist($input: toggleWishlistInput!) {
    toggleWishlist(input: $input) {
      clientMutationId
      wishlist {
        id
        movedToCart
      }
    }
  }
`;
