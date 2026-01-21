import { gql } from "@apollo/client";

export const GET_ALL_BANNERS = gql`
  query GetAllBanners {
    allBanners {
      id
      text
      link
      linkText
      persistent
      reappearing
      clickCount
      createdAt
      updatedAt
    }
  }
`;

export const INCREMENT_BANNER_CLICK = gql`
  mutation IncrementBannerClick($bannerId: ID!) {
    incrementBannerClick(bannerId: $bannerId) {
      id
      clickCount
    }
  }
`;
