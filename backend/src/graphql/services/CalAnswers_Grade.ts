import _ from "lodash";
import { Service, Inject } from "typedi";

import { CalAnswers_Grade } from "#src/models/_index";

import { ReturnModelType } from "@typegoose/typegoose";

const parseArgs = (args) => {
  const newObject = {};
  _.each(args, (value, key) => {
    if (value !== undefined && key !== "CourseControlNbr") {
      newObject[key.replace(/___/g, ".")] = value;
    }
  });
  return newObject;
};

@Service()
export class CalAnswers_GradeService {
  constructor(
    @Inject(CalAnswers_Grade.collection.collectionName)
    private readonly model: ReturnModelType<typeof CalAnswers_Grade>
  ) {}

  get = async (args) => {
    return await this.model.find({
      "Course Control Nbr": args["CourseControlNbr"],
      ...parseArgs(args),
    });
  };
}
