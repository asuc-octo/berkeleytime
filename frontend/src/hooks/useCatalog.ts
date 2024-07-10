import { useContext } from "react";

import CatalogContext from "@/contexts/CatalogContext";

const useCatalog = () => {
  const catalogContext = useContext(CatalogContext);

  if (!catalogContext)
    throw new Error("useCatalog must be used within a CatalogProvider");

  return catalogContext;
};

export default useCatalog;
