import { gql } from "@apollo/client";

export const DELETE_ALL_WISHLISTS = gql`
  mutation DeleteAllWishlists {
    createDeleteAllWishlists(input: {}) {
      deleteAllWishlists {
        message
        deletedCount
      }
    }
  }
`;
