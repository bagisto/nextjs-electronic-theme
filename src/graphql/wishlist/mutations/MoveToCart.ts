import { gql } from "@apollo/client";

export const MOVE_WISHLIST_TO_CART = gql`
  mutation MoveWishlistToCart($input: moveWishlistToCartInput!) {
    moveWishlistToCart(input: $input) {
      wishlistToCart {
        message
      }
    }
  }
`;
