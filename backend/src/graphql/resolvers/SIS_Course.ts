import {
  Args,
  ArgsType,
  Ctx,
  Field,
  Int,
  Resolver,
  Query,
  Root,
} from "type-graphql";

import { SIS_CourseService } from "#src/graphql/services/SIS_Course";
import { SIS_CourseSchema } from "#src/models/_index";

@ArgsType()
class SIS_CourseArgs {
  @Field(() => String, { nullable: false })
  subjectArea___description: string;

  @Field(() => Int)
  id?: number;
}

@Resolver(() => SIS_CourseSchema)
export class SIS_CourseResolver {
  constructor(private readonly service: SIS_CourseService) {}

  @Query(() => [String])
  async Subjects() {
    return await this.service.getSubjects();
  }

  @Query(() => [SIS_CourseSchema])
  async SIS_Course(@Root() root, @Args() args: SIS_CourseArgs, @Ctx() ctx) {
    return await this.service.getCourses(args);
  }
}
