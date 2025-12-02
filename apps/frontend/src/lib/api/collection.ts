import { gql } from "@apollo/client";

import {
  GetCollectionByIdQuery,
  GetAllCollectionsQuery,
} from "../generated/graphql";

export type ICollection = NonNullable<
  GetCollectionByIdQuery["myCollectionById"]
>;
export type ICollectionClass = NonNullable<ICollection["classes"][number]["class"]>;
export type ICollectionSummary = GetAllCollectionsQuery["myCollections"][number];

export const GET_COLLECTION_BY_ID = gql`
  query GetCollectionById($id: ID!) {
    myCollectionById(id: $id) {
      _id
      name
      color
      pinnedAt
      createdAt
      updatedAt
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
      createdAt
      updatedAt
      classes {
        class {
          subject
          courseNumber
          number
        }
        error
      }
    }
  }
`;
