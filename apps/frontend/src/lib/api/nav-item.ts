import { gql } from "@apollo/client";

export const GET_ALL_NAV_ITEMS = gql`
  query GetAllNavItems {
    allNavItems {
      id
      label
      url
      badgeText
      order
    }
  }
`;
