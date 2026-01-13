import { gql } from "@apollo/client";

export const GET_ALL_BANNERS = gql`
  query GetAllBanners {
    allBanners {
      id
      text
      link
      linkText
      persistent
      createdAt
      updatedAt
    }
  }
`;
