import {
  Args,
  ArgsType,
  Ctx,
  Field,
  Resolver,
  Query,
  Root,
} from "type-graphql";

import { CalAnswers_GradeService } from "#src/graphql/services/CalAnswers_Grade";
import { CalAnswers_Grade_Schema } from "#src/models/_index";
import { ENUM_SEMESTER } from "#src/types";

@ArgsType()
class CalAnswers_GradeArgs {
  @Field(() => Number, { nullable: false })
  CourseControlNbr: number;

  @Field(() => Number, { nullable: false })
  termYear: number;

  @Field(() => String, { nullable: false })
  termSemester: ENUM_SEMESTER;
}

@Resolver(() => CalAnswers_Grade_Schema)
export class CalAnswers_GradeResolver {
  constructor(private readonly service: typeof CalAnswers_GradeService) {
    this.service = CalAnswers_GradeService;
  }

  @Query(() => [CalAnswers_Grade_Schema])
  async CalAnswers_Grade(
    @Root() root,
    @Args() { CourseControlNbr, termYear, termSemester }: CalAnswers_GradeArgs,
    @Ctx() ctx
  ) {
    return await this.service.get({
      CourseControlNbr,
      term: {
        year: termYear,
        semester: termSemester,
      },
    });
  }
}
