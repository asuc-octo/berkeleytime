import {
  Args,
  ArgsType,
  Ctx,
  FieldResolver,
  Resolver,
  Query,
  Root,
} from "type-graphql";

import { CalAnswers_GradeService } from "#src/graphql/services/CalAnswers_Grade";
import { CalAnswers_GradeSchema } from "#src/models/_index";

@ArgsType()
class CalAnswers_GradeArgs {}

@Resolver(() => CalAnswers_GradeSchema)
export class CalAnswers_GradeResolver {
  constructor(private readonly service: CalAnswers_GradeService) {}

  @FieldResolver()
  GradeSortNbr(@Root() root: CalAnswers_GradeSchema) {
    return root["Grade Sort Nbr"];
  }

  @FieldResolver()
  EnrollmentCnt(@Root() root: CalAnswers_GradeSchema) {
    return root["Enrollment Cnt"];
  }

  @FieldResolver()
  CourseControlNbr(@Root() root: CalAnswers_GradeSchema) {
    return root["Course Control Nbr"];
  }

  @FieldResolver()
  InstructorName(@Root() root: CalAnswers_GradeSchema) {
    return root["Instructor Name"];
  }

  @FieldResolver()
  CourseSubjectShortNm(@Root() root: CalAnswers_GradeSchema) {
    return root["Course Subject Short Nm"];
  }

  @FieldResolver()
  CourseNumber(@Root() root: CalAnswers_GradeSchema) {
    return root["Course Number"];
  }

  @FieldResolver()
  SectionNbr(@Root() root: CalAnswers_GradeSchema) {
    return root["Section Nbr"];
  }

  @FieldResolver()
  GradeSubtypeDesc(@Root() root: CalAnswers_GradeSchema) {
    return root["Grade Subtype Desc"];
  }

  @FieldResolver()
  GradeTypeDesc(@Root() root: CalAnswers_GradeSchema) {
    return root["Grade Type Desc"];
  }

  @FieldResolver()
  GradeNm(@Root() root: CalAnswers_GradeSchema) {
    return root["Grade Nm"];
  }

  @FieldResolver()
  CourseTitleNm(@Root() root: CalAnswers_GradeSchema) {
    return root["Course Title Nm"];
  }

  @FieldResolver()
  term(@Root() root: CalAnswers_GradeSchema) {
    return root.term;
  }
}
