import { useContext } from "react";

import CollectionContext from "@/contexts/CollectionContext";

const useCollection = () => {
  const collectionContext = useContext(CollectionContext);

  if (!collectionContext)
    throw new Error("useCollection must be used within a UserProvider (? idk what a UserProvider is)");

  return collectionContext;
};

export default useCollection;
