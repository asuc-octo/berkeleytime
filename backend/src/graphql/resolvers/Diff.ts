import { Args, ArgsType, Field, Resolver, Root, Query } from "type-graphql";

import { DiffService } from "#src/graphql/services/Diff";
import { DiffType } from "#src/models/subtypes";
import { ENUM_SEMESTER } from "#src/types";

@ArgsType()
class diffs {
  @Field(() => Number, { nullable: false })
  CourseControlNbr: number;

  @Field(() => Number, { nullable: false })
  year: number;

  @Field(() => String, { nullable: false })
  semester: ENUM_SEMESTER;
}

@Resolver(() => DiffType)
export class DiffResolver {
  @Query(() => [DiffType])
  async Diff(@Root() root, @Args() args: diffs) {
    return await DiffService.diffs({
      args: {
        root,
        CourseControlNbr: args?.CourseControlNbr,
        term: { year: args?.year, semester: args?.semester },
      },
    });
  }
}
