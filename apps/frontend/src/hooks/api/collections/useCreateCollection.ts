import { useCallback } from "react";

import { gql } from "@apollo/client";
import { useMutation } from "@apollo/client/react";

import {
  CreateCollectionDocument,
  CreateCollectionInput,
} from "@/lib/generated/graphql";

const NEW_COLLECTION_FRAGMENT = gql`
  fragment NewCollection on Collection {
    _id
    name
    color
    pinnedAt
    isSystem
    updatedAt
    classes {
      class {
        subject
        courseNumber
        number
      }
    }
  }
`;

export const useCreateCollection = () => {
  const [mutate, result] = useMutation(CreateCollectionDocument);

  const createCollection = useCallback(
    async (
      input: CreateCollectionInput,
      options?: Omit<Parameters<typeof mutate>[0], "variables">
    ) => {
      return await mutate({
        ...options,
        variables: { input },
        update(cache, { data }) {
          if (!data?.createCollection) return;

          cache.modify({
            fields: {
              myCollections: (existing = []) => {
                const newRef = cache.writeFragment({
                  data: data.createCollection,
                  fragment: NEW_COLLECTION_FRAGMENT,
                });
                return [...existing, newRef];
              },
            },
          });
        },
      });
    },
    [mutate]
  );

  return [createCollection, result] as const;
};
