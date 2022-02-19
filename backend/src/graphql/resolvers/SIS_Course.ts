import { Args, ArgsType, Ctx, Resolver, Query, Root } from "type-graphql";

import { SIS_CourseService } from "#src/graphql/services/SIS_Course";
import { SIS_CourseSchema } from "#src/models/_index";

@ArgsType()
class SIS_CourseArgs {}

@Resolver(() => SIS_CourseSchema)
export class SIS_CourseResolver {
  constructor(private readonly service: SIS_CourseService) {}

  @Query(() => [SIS_CourseSchema])
  async SIS_Courses(@Root() root, @Args() args: SIS_CourseArgs, @Ctx() ctx) {
    return await this.service.getAll();
  }
}
