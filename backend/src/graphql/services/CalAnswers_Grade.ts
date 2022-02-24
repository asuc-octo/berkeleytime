import _ from "lodash";
import { Container, Service, Inject } from "typedi";

import { CalAnswers_Grade_Model } from "#src/models/CalAnswers_Grade";

import { ReturnModelType } from "@typegoose/typegoose";

@Service()
class service {
  constructor(
    @Inject(CalAnswers_Grade_Model.collection.collectionName)
    private readonly model: ReturnModelType<typeof CalAnswers_Grade_Model>
  ) {}

  grades = async ({ args }) => {
    if (args.CourseControlNbr && args.term.year && args.term.semester) {
      return await this.model
        .find({
          CourseControlNbr: args.CourseControlNbr,
          "term.year": args.term.year,
          "term.semester": args.term.semester,
        })
        .cache(86400);
    } else {
      const [sectionYear, sectionSemester] = args.root.displayName.split(" ");
      return await this.model
        .find({
          CourseControlNbr: args.root.id,
          "term.year": sectionYear,
          "term.semester": sectionSemester,
        })
        .cache(86400);
    }
  };
}

Container.set(
  CalAnswers_Grade_Model.collection.collectionName,
  CalAnswers_Grade_Model
);
export const CalAnswers_GradeService = Container.get(service);
