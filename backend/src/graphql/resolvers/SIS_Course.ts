import { GraphQLResolveInfo } from "graphql";
import { fieldsProjection } from "graphql-fields-list";
import {
  Args,
  ArgsType,
  Ctx,
  Field,
  FieldResolver,
  Int,
  Resolver,
  Query,
  Root,
  Info,
} from "type-graphql";

import { SIS_CourseService } from "#src/graphql/services/SIS_Course";
import {
  SIS_Class_Schema,
  SIS_Class_Section_Schema,
  SIS_Course_Schema,
} from "#src/models/_index";

@ArgsType()
class ClassArgs {
  @Field(() => String)
  displayName: string;

  @Field(() => Int)
  id?: number;
}

@ArgsType()
class SubjectArgs {
  @Field(() => String)
  displayName?: string;

  @Field(() => String)
  subjectArea___description?: string;
}

@ArgsType()
class _classesArgs {
  @Field()
  year?: number;

  @Field(() => String)
  semester?: string;
}

@Resolver(() => SIS_Course_Schema)
export class SIS_CourseResolver {
  constructor(private readonly service: typeof SIS_CourseService) {
    this.service = SIS_CourseService;
  }

  @Query(() => [String], {
    description: "All departments in human-readable format",
  })
  async Subjects(@Root() root, @Args() args: SubjectArgs, @Ctx() ctx) {
    return await this.service.getSubjects();
  }

  @Query(() => [SIS_Course_Schema])
  async SIS_Course(
    @Root() root,
    @Args() args: SubjectArgs,
    @Ctx() ctx,
    @Info() info: GraphQLResolveInfo
  ) {
    return await this.service.getCourses(args, fieldsProjection(info));
  }

  @FieldResolver(() => [SIS_Class_Schema])
  async _classes(@Root() root, @Args() args: _classesArgs) {
    return await this.service.getClasses({
      courseId: root._courseId(),
      ...args,
    });
  }

  @FieldResolver(() => [SIS_Class_Section_Schema])
  async _sections(@Root() root, @Args() args: _classesArgs) {
    return await this.service.getSections({
      courseId: root._courseId(),
      ...args,
    });
  }
}
