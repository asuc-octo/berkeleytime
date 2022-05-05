import { GraphQLResolveInfo } from "graphql";
import { fieldsProjection } from "graphql-fields-list";
import { Int } from "type-graphql";
import {
  Args,
  ArgsType,
  Ctx,
  FieldResolver,
  Info,
  Resolver,
  Query,
  Root,
} from "type-graphql";

import { SIS_ClassService } from "#src/graphql/services/SIS_Class";
import { SIS_Class_SectionService } from "#src/graphql/services/SIS_Class_Section";
import { SIS_Class_Schema, SIS_Class_Section_Schema } from "#src/models/_index";

@ArgsType()
class SIS_ClassArgs {}

@Resolver(() => SIS_Class_Schema)
export class SIS_ClassResolver {
  @Query(() => [SIS_Class_Schema])
  async SIS_Class(@Root() root, @Args() args: SIS_ClassArgs, @Ctx() ctx) {
    return await SIS_ClassService.sample();
  }

  @FieldResolver(() => Int)
  async _ccn(@Root() root) {
    return await SIS_ClassService.ccn({
      args: { root },
    });
  }

  @Query(() => [String], {
    description:
      "All semesters based on classes linked to an active SIS_Course. Sorts by by term.id first, then returns Array of human-readable term.name",
  })
  async semesters() {
    return await SIS_ClassService.semesters();
  }

  @FieldResolver(() => [SIS_Class_Section_Schema])
  async _sections(@Root() root, @Info() info: GraphQLResolveInfo) {
    return await SIS_Class_SectionService.sections({
      args: { root },
      projection: fieldsProjection(info),
    });
  }
}
