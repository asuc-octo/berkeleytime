import _ from "lodash";
import { Container, Service, Inject } from "typedi";

import { CalAnswers_Grade } from "#src/models/CalAnswers_Grade";

import { ReturnModelType } from "@typegoose/typegoose";

@Service()
class service {
  constructor(
    @Inject(CalAnswers_Grade.collection.collectionName)
    private readonly model: ReturnModelType<typeof CalAnswers_Grade>
  ) {}

  get = async ({ CourseControlNbr, term }) => {
    return await this.model.find({
      CourseControlNbr,
      "term.year": term.year,
      "term.semester": term.semester,
    });
  };
}

Container.set(CalAnswers_Grade.collection.collectionName, CalAnswers_Grade);
export const CalAnswers_GradeService = Container.get(service);
