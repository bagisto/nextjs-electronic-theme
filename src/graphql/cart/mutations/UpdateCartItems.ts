import { gql } from "@apollo/client";

export const UPDATE_CART_ITEM = gql`
  mutation UpdateCartItem(
    $cartItemId: Int!
    $quantity: Int!
    $groupedQty: String
    $bundleOptions: String
    $bundleOptionQty: String
    $links: Iterable
    $booking: String
    $bookingNote: String
  ) {
    createUpdateCartItem(
      input: {
        cartItemId: $cartItemId
        quantity: $quantity
        groupedQty: $groupedQty
        bundleOptions: $bundleOptions
        bundleOptionQty: $bundleOptionQty
        links: $links
        booking: $booking
        bookingNote: $bookingNote
      }
    ) {
      updateCartItem {
        id
        taxAmount
        shippingAmount
        subtotal
        grandTotal
        items {
          edges {
            node {
              id
              cartId
              productId
              name
              price
              basePrice
              baseImage
              sku
              quantity
              type
              productUrlKey
              canChangeQty
            }
          }
        }
        itemsQty
        grandTotal
      }
    }
  }
`;
