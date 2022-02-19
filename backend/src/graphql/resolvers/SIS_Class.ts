import { Args, ArgsType, Ctx, Resolver, Query, Root } from "type-graphql";

import { SIS_ClassService } from "#src/graphql/services/SIS_Class";
import { SIS_ClassSchema } from "#src/models/_index";

@ArgsType()
class SIS_ClassArgs {}

@Resolver(() => SIS_ClassSchema)
export class SIS_ClassResolver {
  constructor(private readonly service: SIS_ClassService) {}

  @Query(() => [SIS_ClassSchema])
  async SIS_Classes(@Root() root, @Args() args: SIS_ClassArgs, @Ctx() ctx) {
    return await this.service.getAll();
  }
}
