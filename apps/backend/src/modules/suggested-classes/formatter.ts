import { SuggestedClassesModule } from "./generated-types/module-types";

interface PostRelationships {
  class: null;
}

export type IntermediatePost = Omit<
  SuggestedClassesModule.Post,
  keyof PostRelationships
> &
  PostRelationships;
