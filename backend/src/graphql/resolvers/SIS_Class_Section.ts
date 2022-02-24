import {
  Args,
  ArgsType,
  Ctx,
  Field,
  Resolver,
  Query,
  Root,
} from "type-graphql";

import { SIS_Class_SectionService } from "#src/graphql/services/SIS_Class_Section";
import { SIS_Class_Schema, SIS_Class_Section_Schema } from "#src/models/_index";

type ENUM_SEMESTER = "Spring" | "Summer" | "Fall";

@ArgsType()
class SIS_Class_SectionArgs {
  @Field(() => Number, { nullable: false })
  id: number;

  @Field(() => Number, { nullable: false })
  year: number;

  @Field(() => String, { nullable: false })
  semester: ENUM_SEMESTER;
}

@Resolver(() => SIS_Class_Schema)
export class SIS_Class_SectionResolver {
  constructor(private readonly service: typeof SIS_Class_SectionService) {
    this.service = SIS_Class_SectionService;
  }

  @Query(() => [SIS_Class_Section_Schema])
  async SIS_Class_Section(
    @Root() root,
    @Args() args: SIS_Class_SectionArgs,
    @Ctx() ctx
  ) {
    return await this.service.get(args);
  }
}
