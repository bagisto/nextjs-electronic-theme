import { gql } from "@apollo/client";

export const GET_CHECKOUT_PAYMENT_METHODS = gql`
  query CheckoutPaymentMethods{
    collectionPaymentMethods {
      id
      method
      title
      description
      icon
      isAllowed
    }
  }
`;
