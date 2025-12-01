import { gql } from "@apollo/client";
import { type Collection } from "../generated/graphql";

export type ICollection = Collection;

export const MY_COLLECTIONS = gql`
  query MyCollections {
    myCollections {
      name
      classes {
        class {
            title
            subject
            number
            courseNumber
            year
            semester
            sessionId
        }
        personalNote {
            text
        }
        error
      }
    }
  }
`;

export const MY_COLLECTION = gql`
  query MyCollection($name: String!) {
    myCollection(name: $name) {
      name
      classes {
        class {
            title
            subject
            number
            courseNumber
            year
            semester
            sessionId
        }
        personalNote {
            text
        }
        error
      }
    }
  }
`;

export const ADD_CLASS = gql`
  mutation AddClassToCollection($input: AddClassInput!) {
    addClassToCollection(input: $input) {
      _id
      classes {
          class {
              subject
              number
              courseNumber
              year
              semester
              sessionId
          }
          personalNote {
              text
          }
          error
        }
      name
    }
  }
`;

export const REMOVE_CLASS = gql`
  mutation RemoveClassFromCollection($input: RemoveClassInput!) {
    removeClassFromCollection(input: $input) {
      _id
      classes {
          class {
              subject
              number
              courseNumber
              year
              semester
              sessionId
          }
          personalNote {
              text
          }
          error
        }
      name
    }
  }
`;

export const DELETE_COLLECTION = gql`
  mutation DeleteCollection($name: String!) {
    deleteCollection(name: $name)
  }
`;