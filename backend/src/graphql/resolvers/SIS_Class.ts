import { Args, ArgsType, Ctx, Resolver, Query, Root } from "type-graphql";

import { SIS_ClassService } from "#src/graphql/services/SIS_Class";
import { SIS_Class_Schema } from "#src/models/_index";

@ArgsType()
class SIS_ClassArgs {}

@Resolver(() => SIS_Class_Schema)
export class SIS_ClassResolver {
  constructor(private readonly service: typeof SIS_ClassService) {
    this.service = SIS_ClassService;
  }

  @Query(() => [SIS_Class_Schema])
  async SIS_Class(@Root() root, @Args() args: SIS_ClassArgs, @Ctx() ctx) {
    return await this.service.sample();
  }
}
