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

  get = async ({ CourseControlNbr, term }) => {
    return await this.model
      .find({
        CourseControlNbr,
        "term.year": term.year,
        "term.semester": term.semester,
      })
      .cache(86400);
  };
}

Container.set(
  CalAnswers_Grade_Model.collection.collectionName,
  CalAnswers_Grade_Model
);
export const CalAnswers_GradeService = Container.get(service);
