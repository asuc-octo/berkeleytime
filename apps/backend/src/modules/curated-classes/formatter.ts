import { CuratedClassesModule } from "./generated-types/module-types";

interface CuratedClassRelationships {
  class: null;
}

export type IntermediateCuratedClass = Omit<
  CuratedClassesModule.CuratedClass,
  keyof CuratedClassRelationships
> &
  CuratedClassRelationships;
