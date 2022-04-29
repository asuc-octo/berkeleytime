import { GraphQLResolveInfo } from "graphql";
import { fieldsProjection } from "graphql-fields-list";
import _ from "lodash";
import {
  Args,
  ArgsType,
  Field,
  FieldResolver,
  Resolver,
  Query,
  Root,
  Info,
} from "type-graphql";

import { SIS_CourseService } from "#src/graphql/services/SIS_Course";
import { SIS_Class_Schema, SIS_Course_Schema } from "#src/models/_index";

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
  @Query(() => [String], {
    description: "All departments in human-readable format",
  })
  async subjects() {
    return await SIS_CourseService.subjects();
  }

  @Query(() => [String], {
    description: "Quick query for all SIS_Course displayNames, nothing else",
  })
  async courseNames() {
    return await SIS_CourseService.courseNames();
  }

  @Query(() => [String], {
    description: "Get all department names of SIS_Course",
  })
  async departmentNames() {
    return await SIS_CourseService.departmentNames();
  }

  @Query(() => [SIS_Course_Schema])
  async SIS_Course(
    @Args() args: SubjectArgs,
    @Info() info: GraphQLResolveInfo
  ) {
    return await SIS_CourseService.courses(args, fieldsProjection(info));
  }

  @FieldResolver(() => String)
  _courseId(@Root() root) {
    return _.find(root.identifiers, {
      type: "cs-course-id",
    }).id;
  }

  @FieldResolver(() => [SIS_Class_Schema])
  async _classes(@Root() root, @Args() args: _classesArgs) {
    return await SIS_CourseService.classes({
      courseId: this._courseId(root),
      args,
    });
  }
}
