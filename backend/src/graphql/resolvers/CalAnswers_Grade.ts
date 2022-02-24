import { Args, ArgsType, Field, Resolver, Root, Query } from "type-graphql";

import { CalAnswers_GradeService } from "#src/graphql/services/CalAnswers_Grade";
import { CalAnswers_Grade_Schema } from "#src/models/_index";
import { ENUM_SEMESTER } from "#src/types";

@ArgsType()
class grades {
  @Field(() => Number, { nullable: false })
  CourseControlNbr: number;

  @Field(() => Number, { nullable: false })
  year: number;

  @Field(() => String, { nullable: false })
  semester: ENUM_SEMESTER;
}

@Resolver(() => CalAnswers_Grade_Schema)
export class CalAnswers_GradeResolver {
  @Query(() => [CalAnswers_Grade_Schema])
  async CalAnswers_Grade(@Root() root, @Args() args: grades) {
    return await CalAnswers_GradeService.grades({
      args: {
        root: root,
        CourseControlNbr: args?.CourseControlNbr,
        term: { year: args?.year, semester: args?.semester },
      },
    });
  }
}
