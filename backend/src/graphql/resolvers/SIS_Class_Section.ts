import { GraphQLResolveInfo } from "graphql";
import { fieldsProjection } from "graphql-fields-list";
import {
  Args,
  ArgsType,
  Ctx,
  Field,
  FieldResolver,
  Info,
  Resolver,
  Query,
  Root,
} from "type-graphql";

import { CalAnswers_GradeService } from "#src/graphql/services/CalAnswers_Grade";
import { SIS_Class_SectionService } from "#src/graphql/services/SIS_Class_Section";
import {
  CalAnswers_Grade_Schema,
  SIS_Class_Section_Schema,
} from "#src/models/_index";

type ENUM_SEMESTER = "Spring" | "Summer" | "Fall";

@ArgsType()
class query {
  @Field(() => Number, { nullable: false })
  id: number;

  @Field(() => Number, { nullable: false })
  year: number;

  @Field(() => String, { nullable: false })
  semester: ENUM_SEMESTER;
}

@ArgsType()
class grades {
  @Field(() => Number, { nullable: false })
  CourseControlNbr: number;

  @Field(() => Number, { nullable: false })
  year: number;

  @Field(() => String, { nullable: false })
  semester: ENUM_SEMESTER;
}

@Resolver(() => SIS_Class_Section_Schema)
export class SIS_Class_SectionResolver {
  @Query(() => [SIS_Class_Section_Schema])
  async SIS_Class_Section(
    @Args() args: query,
    @Info() info: GraphQLResolveInfo
  ) {
    return await SIS_Class_SectionService.sections({
      args,
      projection: fieldsProjection(info),
    });
  }

  @FieldResolver(() => [CalAnswers_Grade_Schema])
  async _grades(@Root() root, args: grades) {
    const [sectionYear, sectionSemester] = root.displayName.split(" ");
    return await CalAnswers_GradeService.grades({
      args: {
        root,
        CourseControlNbr: args?.CourseControlNbr,
        term: {
          year: args?.year ?? sectionYear,
          semester: args?.semester ?? sectionSemester,
        },
      },
    });
  }
}
