import { gql } from "@apollo/client";

export const CREATE_CUSTOMER_ADDRESS = gql`
  mutation CreateCustomerAddress($input: createAddUpdateCustomerAddressInput!) {
    createAddUpdateCustomerAddress(input: $input) {
      addUpdateCustomerAddress {
        id
        firstName
        lastName
        city
        state
        country
        phone
        addressId
        email
        address1
        address2
        postcode
        defaultAddress
      }
    }
  }
`;
