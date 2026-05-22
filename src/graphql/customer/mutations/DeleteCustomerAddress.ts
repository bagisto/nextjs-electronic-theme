import { gql } from "@apollo/client";

export const DELETE_CUSTOMER_ADDRESS = gql`
  mutation DeleteCustomerAddress($input: createDeleteCustomerAddressInput!) {
    createDeleteCustomerAddress(input: $input) {
        deleteCustomerAddress {
            addressId
            id
        }
    }
  }
`;
