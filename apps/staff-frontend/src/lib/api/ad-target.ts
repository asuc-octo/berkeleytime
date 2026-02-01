import { gql } from "@apollo/client";

// Types
export interface AdTarget {
  id: string;
  subjects: string[];
  minCourseNumber: string | null;
  maxCourseNumber: string | null;
  specificClassIds: string[];
  createdAt: string;
}

export interface CreateAdTargetInput {
  subjects?: string[] | null;
  minCourseNumber?: string | null;
  maxCourseNumber?: string | null;
  specificClassIds?: string[] | null;
}

export interface UpdateAdTargetInput {
  subjects?: string[] | null;
  minCourseNumber?: string | null;
  maxCourseNumber?: string | null;
  specificClassIds?: string[] | null;
}

// Queries
export const ALL_AD_TARGETS = gql`
  query AllAdTargets {
    allAdTargets {
      id
      subjects
      minCourseNumber
      maxCourseNumber
      specificClassIds
      createdAt
    }
  }
`;

// Mutations
export const CREATE_AD_TARGET = gql`
  mutation CreateAdTarget($input: CreateAdTargetInput!) {
    createAdTarget(input: $input) {
      id
      subjects
      minCourseNumber
      maxCourseNumber
      specificClassIds
      createdAt
    }
  }
`;

export const UPDATE_AD_TARGET = gql`
  mutation UpdateAdTarget($adTargetId: ID!, $input: UpdateAdTargetInput!) {
    updateAdTarget(adTargetId: $adTargetId, input: $input) {
      id
      subjects
      minCourseNumber
      maxCourseNumber
      specificClassIds
      createdAt
    }
  }
`;

export const DELETE_AD_TARGET = gql`
  mutation DeleteAdTarget($adTargetId: ID!) {
    deleteAdTarget(adTargetId: $adTargetId)
  }
`;
