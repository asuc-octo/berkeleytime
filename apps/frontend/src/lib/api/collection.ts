import { gql } from "@apollo/client";

import {
  GetAllCollectionsQuery,
  GetAllCollectionsWithPreviewQuery,
  GetCollectionByIdQuery,
} from "../generated/graphql";

export type ICollection = NonNullable<
  GetCollectionByIdQuery["myCollectionById"]
>;
export type ICollectionClass = NonNullable<
  ICollection["classes"][number]["class"]
>;
export type ICollectionSummary =
  GetAllCollectionsQuery["myCollections"][number];
export type ICollectionWithPreview =
  GetAllCollectionsWithPreviewQuery["myCollections"][number];
export type ICollectionPreviewClass = NonNullable<
  ICollectionWithPreview["classes"][number]["class"]
>;

export const GET_COLLECTION_BY_ID = gql`
  query GetCollectionById($id: ID!) {
    myCollectionById(id: $id) {
      name
      classes {
        class {
          subject
          courseNumber
          number
          title
          year
          semester
          unitsMin
          unitsMax
          course {
            title
            gradeDistribution {
              average
            }
          }
          gradeDistribution {
            average
          }
          primarySection {
            enrollment {
              latest {
                enrolledCount
                maxEnroll
                endTime
                activeReservedMaxCount
              }
            }
          }
        }
        error
      }
    }
  }
`;

export const GET_ALL_COLLECTIONS = gql`
  query GetAllCollections {
    myCollections {
      _id
      name
      color
      pinnedAt
      isSystem
      lastAdd
      classes {
        class {
          subject
          courseNumber
          number
        }
      }
    }
  }
`;

export const GET_ALL_COLLECTIONS_WITH_PREVIEW = gql`
  query GetAllCollectionsWithPreview {
    myCollections {
      _id
      name
      color
      pinnedAt
      isSystem
      lastAdd
      classes {
        addedAt
        class {
          subject
          courseNumber
          number
          title
          unitsMin
          unitsMax
          course {
            title
            gradeDistribution {
              average
            }
          }
          gradeDistribution {
            average
          }
          primarySection {
            enrollment {
              latest {
                enrolledCount
                maxEnroll
                activeReservedMaxCount
              }
            }
          }
        }
      }
    }
  }
`;

export const ADD_CLASS_TO_COLLECTION = gql`
  mutation AddClassToCollection($input: AddClassInput!) {
    addClassToCollection(input: $input) {
      _id
      name
      color
      pinnedAt
      isSystem
      lastAdd
      classes {
        class {
          subject
          courseNumber
          number
        }
      }
    }
  }
`;

export const REMOVE_CLASS_FROM_COLLECTION = gql`
  mutation RemoveClassFromCollection($input: RemoveClassInput!) {
    removeClassFromCollection(input: $input) {
      _id
      name
      color
      pinnedAt
      isSystem
      lastAdd
      classes {
        class {
          subject
          courseNumber
          number
        }
      }
    }
  }
`;

export const CREATE_COLLECTION = gql`
  mutation CreateCollection($input: CreateCollectionInput!) {
    createCollection(input: $input) {
      _id
      name
      color
      pinnedAt
      isSystem
      lastAdd
      classes {
        class {
          subject
          courseNumber
          number
        }
      }
    }
  }
`;

export const UPDATE_COLLECTION = gql`
  mutation UpdateCollection($id: ID!, $input: UpdateCollectionInput!) {
    updateCollection(id: $id, input: $input) {
      _id
      name
      color
      pinnedAt
      isSystem
      lastAdd
    }
  }
`;

export const DELETE_COLLECTION = gql`
  mutation DeleteCollection($id: ID!) {
    deleteCollection(id: $id)
  }
`;
