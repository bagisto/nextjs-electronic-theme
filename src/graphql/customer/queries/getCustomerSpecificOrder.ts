import { gql } from "@apollo/client";

export const GET_CUSTOMER_ORDER_ID = gql`
  query CustomerOrder($id: ID!) {
    customerOrder(id: $id) {
      id
      createdAt
      subTotal
      incrementId
      status
      grandTotal
      shippingTitle
      payment {
        methodTitle
      }
      addresses {
        edges {
          node {
            id
            addressType
            firstName
            lastName
            companyName
            address
            city
            state
            country
            postcode
            phone
            useForShipping
          }
        }
      }
      items {
        edges {
          node {
            id
            sku
            name
            qtyOrdered
            total
            price
          }
        }
      }
          }
  }
`;
