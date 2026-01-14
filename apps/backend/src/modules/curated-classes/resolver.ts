import { getClass } from "../class/controller";
import {
  createCuratedClass,
  deleteCuratedClass,
  getCuratedClass,
  getCuratedClasses,
  updateCuratedClass,
} from "./controller";
import { IntermediateCuratedClass } from "./formatter";
import { CuratedClassesModule } from "./generated-types/module-types";

const resolvers: CuratedClassesModule.Resolvers = {
  Query: {
    curatedClasses: async () => {
      const curatedClasses = await getCuratedClasses();
      return curatedClasses as unknown as CuratedClassesModule.CuratedClass[];
    },
    curatedClass: async (_, { id }, context) => {
      const curatedClass = await getCuratedClass(context, id);
      return curatedClass as unknown as CuratedClassesModule.CuratedClass;
    },
  },

  CuratedClass: {
    class: async (
      parent: CuratedClassesModule.CuratedClass | IntermediateCuratedClass
    ) => {
      if (parent.class && (parent.class as CuratedClassesModule.Class).title)
        return parent.class as CuratedClassesModule.Class;

      const _class = await getClass(
        parent.year,
        parent.semester,
        parent.sessionId,
        parent.subject,
        parent.courseNumber,
        parent.number
      );

      return _class as unknown as CuratedClassesModule.Class;
    },
  },

  Mutation: {
    createCuratedClass: async (_, { curatedClass }, context) => {
      const createdCuratedClass = await createCuratedClass(
        context,
        curatedClass
      );
      return createdCuratedClass as unknown as CuratedClassesModule.CuratedClass;
    },

    updateCuratedClass: async (_, { id, curatedClass }, context) => {
      const updatedCuratedClass = await updateCuratedClass(
        context,
        id,
        curatedClass
      );
      return updatedCuratedClass as unknown as CuratedClassesModule.CuratedClass;
    },

    deleteCuratedClass: async (_, { id }, context) => {
      return await deleteCuratedClass(context, id);
    },
  },
};

export default {
  ...resolvers,
};
