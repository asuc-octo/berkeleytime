import {
  addClassToCollection,
  createCollection,
  getCollectionOwner,
  getCollectionViewer,
  modifyCollectionComment,
} from "./controller";
import { CollectionModule } from "./generated-types/module-types";

const resolvers: CollectionModule.Resolvers = {
  Query: {
    ownerCollection: async (_, __, context) => {
      const collection = await getCollectionOwner(context);

      return collection as unknown as CollectionModule.Collection[];
    },
    viewerCollection: async (_, __, context) => {
      const collection = await getCollectionViewer(context);

      return collection as unknown as CollectionModule.Collection[];
    },
  },

  Mutation: {
    createCollection: async (_, { input }) => {
      const collection = await createCollection(input);

      return collection as unknown as CollectionModule.Collection;
    },
    addClassToCollection: async (_, { input }) => {
      const collection = await addClassToCollection(input);

      return collection as unknown as CollectionModule.Collection;
    },
    modifyCollectionComment: async (_, { input }) => {
      const collection = await modifyCollectionComment(input);

      return collection as unknown as CollectionModule.Collection;
    },
  },
};
export default resolvers;
