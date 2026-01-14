import { gql } from "@apollo/client";

// Types
export type Semester = "Spring" | "Summer" | "Fall" | "Winter";

export interface Pod {
  id: string;
  name: string;
  semester: Semester;
  year: number;
}

// Queries
export const ALL_PODS = gql`
  query AllPods {
    allPods {
      id
      name
      semester
      year
    }
  }
`;

// Mutations
export interface CreatePodInput {
  name: string;
  semester: Semester;
  year: number;
}

export const CREATE_POD = gql`
  mutation CreatePod($input: CreatePodInput!) {
    createPod(input: $input) {
      id
      name
      semester
      year
    }
  }
`;

export const DELETE_POD = gql`
  mutation DeletePod($podId: ID!) {
    deletePod(podId: $podId)
  }
`;
