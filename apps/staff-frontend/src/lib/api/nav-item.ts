import { gql } from "@apollo/client";

// Types
export interface NavItem {
  id: string;
  label: string;
  url: string;
  badgeText: string | null;
  order: number;
  visible: boolean;
  clickCount: number;
  createdAt: string;
  updatedAt: string;
}

// Queries
export const ALL_NAV_ITEMS_FOR_STAFF = gql`
  query AllNavItemsForStaff {
    allNavItemsForStaff {
      id
      label
      url
      badgeText
      order
      visible
      clickCount
      createdAt
      updatedAt
    }
  }
`;

// Mutations
export interface CreateNavItemInput {
  label: string;
  url: string;
  badgeText?: string | null;
  order?: number | null;
  visible?: boolean | null;
}

export interface UpdateNavItemInput {
  label?: string | null;
  url?: string | null;
  badgeText?: string | null;
  order?: number | null;
  visible?: boolean | null;
}

export const CREATE_NAV_ITEM = gql`
  mutation CreateNavItem($input: CreateNavItemInput!) {
    createNavItem(input: $input) {
      id
      label
      url
      badgeText
      order
      visible
      clickCount
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_NAV_ITEM = gql`
  mutation UpdateNavItem($navItemId: ID!, $input: UpdateNavItemInput!) {
    updateNavItem(navItemId: $navItemId, input: $input) {
      id
      label
      url
      badgeText
      order
      visible
      clickCount
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_NAV_ITEM = gql`
  mutation DeleteNavItem($navItemId: ID!) {
    deleteNavItem(navItemId: $navItemId)
  }
`;
