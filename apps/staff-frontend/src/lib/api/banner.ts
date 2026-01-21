import { gql } from "@apollo/client";

// Types
export interface Banner {
  id: string;
  text: string;
  link: string | null;
  linkText: string | null;
  persistent: boolean;
  reappearing: boolean;
  createdAt: string;
  updatedAt: string;
}

// Queries
export const ALL_BANNERS = gql`
  query AllBanners {
    allBanners {
      id
      text
      link
      linkText
      persistent
      reappearing
      createdAt
      updatedAt
    }
  }
`;

// Mutations
export interface CreateBannerInput {
  text: string;
  link?: string | null;
  linkText?: string | null;
  persistent: boolean;
  reappearing: boolean;
}

export interface UpdateBannerInput {
  text?: string | null;
  link?: string | null;
  linkText?: string | null;
  persistent?: boolean | null;
  reappearing?: boolean | null;
}

export const CREATE_BANNER = gql`
  mutation CreateBanner($input: CreateBannerInput!) {
    createBanner(input: $input) {
      id
      text
      link
      linkText
      persistent
      reappearing
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_BANNER = gql`
  mutation UpdateBanner($bannerId: ID!, $input: UpdateBannerInput!) {
    updateBanner(bannerId: $bannerId, input: $input) {
      id
      text
      link
      linkText
      persistent
      reappearing
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_BANNER = gql`
  mutation DeleteBanner($bannerId: ID!) {
    deleteBanner(bannerId: $bannerId)
  }
`;
