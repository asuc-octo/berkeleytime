/* This was created by ChatGPT, I do not know what the provider is to do
import { ReactNode, useCallback, useMemo } from "react";
import { useMutation, useQuery } from "@apollo/client";

import CollectionContext from "@/contexts/CollectionContext";
import {
  MY_COLLECTIONS,
  MY_COLLECTION,
  ADD_CLASS,
  DELETE_COLLECTION,
  REMOVE_CLASS,
} from "@/lib/api/collection";
import {
  type AddClassInput,
  type RemoveClassInput,
} from "@/lib/generated/graphql";

interface CollectionProviderProps {
  children: ReactNode;
}

const CollectionProvider = ({ children }: CollectionProviderProps) => {
  const {
    data,
    loading,
    error,
    refetch,
  } = useQuery(MY_COLLECTIONS, {
    fetchPolicy: "cache-and-network",
  });

  const [addClassMutation] = useMutation(ADD_CLASS);
  const [removeClassMutation] = useMutation(REMOVE_CLASS);
  const [deleteCollectionMutation] = useMutation(DELETE_COLLECTION);

  const refreshCollections = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const addClassToCollection = useCallback(
    async (input: AddClassInput) => {
      await addClassMutation({ variables: { input } });
      await refreshCollections();
    },
    [addClassMutation, refreshCollections]
  );

  const removeClassFromCollection = useCallback(
    async (input: RemoveClassInput) => {
      await removeClassMutation({ variables: { input } });
      await refreshCollections();
    },
    [removeClassMutation, refreshCollections]
  );

  const deleteCollection = useCallback(
    async (name: string) => {
      await deleteCollectionMutation({ variables: { name } });
      await refreshCollections();
    },
    [deleteCollectionMutation, refreshCollections]
  );

  const value = useMemo(
    () => ({
      collection: data?.myCollections?.[0],
      collections: data?.myCollections ?? [],
      loading,
      error: error ?? undefined,
      addClassToCollection,
      removeClassFromCollection,
      deleteCollection,
    }),
    [
      addClassToCollection,
      data?.myCollections,
      deleteCollection,
      error,
      loading,
      removeClassFromCollection,
    ]
  );

  return (
    <CollectionContext.Provider value={value}>
      {children}
    </CollectionContext.Provider>
  );
};

export default CollectionProvider;

*/
