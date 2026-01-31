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
      highMetrics
      dismissCount
      viewCount
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

export const INCREMENT_BANNER_DISMISS = gql`
  mutation IncrementBannerDismiss($bannerId: ID!) {
    incrementBannerDismiss(bannerId: $bannerId) {
      id
      dismissCount
    }
  }
`;

export const TRACK_BANNER_VIEW = gql`
  mutation TrackBannerView($bannerId: ID!) {
    trackBannerView(bannerId: $bannerId)
  }
`;
