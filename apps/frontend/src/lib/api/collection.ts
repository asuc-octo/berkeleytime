import { gql } from "@apollo/client";
import { type Collection } from "../generated/graphql";

export type ICollection = Collection;

export const GET_OWNER_COLLECTION = gql`
  query OwnerCollection($ownerId: String!) {
    ownerCollection(ownerID: $ownerId) {
      name
      ownerID
      viewerID
      classes {
        info {
          title
          subject
          number
          courseNumber
          year
          semester
          sessionId
          unitsMin
          unitsMax
          course {
            title
          }
          primarySection {
            enrollment {
              latest {
                enrolledCount
                maxEnroll
                waitlistedCount
                maxWaitlist
              }
            }
          }
          gradeDistribution {
            average
          }
        }
        comments
      }
    }
  }
`;

export const MODIFY_COLLECTION_CLASS = gql`
  mutation ModifyCollectionClass($input: ModifyCollectionClassInput!) {
    modifyCollectionClass(input: $input) {
      ownerID
      name
      classes {
        info {
          courseNumber
          courseId
        }
        comments
      }
    }
  }
`;

export const MODIFY_COLLECTION_COMMENT = gql`
  mutation ModifyCollectionComment($input: ModifyCollectionCommentInput!) {
    modifyCollectionComment(input: $input) {
      ownerID
      name
      classes {
        info {
          courseNumber
          courseId
        }
        comments
      }
    }
  }
`;
