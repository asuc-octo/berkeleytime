import { gql } from "@apollo/client";

import { Semester } from "./terms";

// Types
export interface AdTarget {
  id: string;
  subjects: string[];
  minCourseNumber: string | null;
  maxCourseNumber: string | null;
  createdAt: string;
}

export interface AdTargetPreviewClass {
  courseId: string;
  subject: string;
  courseNumber: string;
  number: string;
  title: string | null;
  year: number;
  semester: Semester;
  sessionId: string;
}

export interface CreateAdTargetInput {
  subjects?: string[] | null;
  minCourseNumber?: string | null;
  maxCourseNumber?: string | null;
}

export interface UpdateAdTargetInput {
  subjects?: string[] | null;
  minCourseNumber?: string | null;
  maxCourseNumber?: string | null;
}

// Queries
export const ALL_AD_TARGETS = gql`
  query AllAdTargets {
    allAdTargets {
      id
      subjects
      minCourseNumber
      maxCourseNumber
      createdAt
    }
  }
`;

export const AD_TARGET_PREVIEW = gql`
  query AdTargetPreview(
    $year: Int!
    $semester: Semester!
    $subjects: [String!]
    $minCourseNumber: String
    $maxCourseNumber: String
  ) {
    adTargetPreview(
      year: $year
      semester: $semester
      subjects: $subjects
      minCourseNumber: $minCourseNumber
      maxCourseNumber: $maxCourseNumber
    ) {
      courseId
      subject
      courseNumber
      number
      title
      year
      semester
      sessionId
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
      createdAt
    }
  }
`;

export const DELETE_AD_TARGET = gql`
  mutation DeleteAdTarget($adTargetId: ID!) {
    deleteAdTarget(adTargetId: $adTargetId)
  }
`;
