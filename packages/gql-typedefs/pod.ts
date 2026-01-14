import { gql } from "graphql-tag";

export const podTypeDef = gql`
  """
  A pod (team) associated with a specific semester and year.
  """
  type Pod @cacheControl(maxAge: 0) {
    id: ID!
    name: String!
    semester: Semester!
    year: Int!
  }

  type Query {
    """
    Get all pods.
    """
    allPods: [Pod!]!
  }

  """
  Input for creating a pod.
  """
  input CreatePodInput {
    name: String!
    semester: Semester!
    year: Int!
  }

  type Mutation {
    """
    Create a new pod.
    """
    createPod(input: CreatePodInput!): Pod! @auth

    """
    Delete a pod by ID.
    """
    deletePod(podId: ID!): Boolean! @auth
  }
`;
