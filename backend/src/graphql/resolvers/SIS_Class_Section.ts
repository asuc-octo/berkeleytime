import { Args, ArgsType, Ctx, Resolver, Query, Root } from "type-graphql";

import { SIS_Class_SectionService } from "#src/graphql/services/SIS_Class_Section";
import { SIS_Class_SectionSchema } from "#src/models/_index";

@ArgsType()
class SIS_Class_SectionArgs {}

@Resolver(() => SIS_Class_SectionSchema)
export class SIS_Class_SectionResolver {
  constructor(private readonly service: SIS_Class_SectionService) {}

  @Query(() => [SIS_Class_SectionSchema])
  async SIS_Class_Section(
    @Root() root,
    @Args() args: SIS_Class_SectionArgs,
    @Ctx() ctx
  ) {
    return await this.service.getAll();
  }
}
