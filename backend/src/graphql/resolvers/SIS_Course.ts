import _ from "lodash";
import {
  Args,
  ArgsType,
  Ctx,
  FieldResolver,
  Resolver,
  Query,
  Root,
} from "type-graphql";

import { SIS_CourseService } from "#src/graphql/services/SIS_Course";
import { SIS_CourseSchema } from "#src/models/_index";
import { Identifier } from "#src/models/subtypes";

@ArgsType()
class SIS_CourseArgs {}

@Resolver(() => SIS_CourseSchema)
export class SIS_CourseResolver {
  constructor(private readonly service: SIS_CourseService) {}

  @Query(() => [SIS_CourseSchema])
  async SIS_Courses(@Root() root, @Args() args: SIS_CourseArgs, @Ctx() ctx) {
    return await this.service.getAll();
  }

  @FieldResolver()
  description(@Root() parent: SIS_CourseSchema) {
    return parent.description;
  }

  @FieldResolver()
  catalogNumber___formatted(@Root() root: SIS_CourseSchema) {
    console.info(root);
    return _.get(root, "catalogNumber.formatted");
  }

  @FieldResolver()
  credit___value(@Root() root: SIS_CourseSchema) {
    return _.get(root, "credit.value");
  }

  @FieldResolver()
  subjectArea___code(@Root() root: SIS_CourseSchema) {
    return _.get(root, "subjectArea.code");
  }

  @FieldResolver()
  subjectArea___description(@Root() root: SIS_CourseSchema) {
    return _.get(root, "subjectArea.description");
  }
}
