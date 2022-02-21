import _ from "lodash";
import { Service, Inject } from "typedi";

import { SIS_Course } from "#src/models/_index";

import { ReturnModelType } from "@typegoose/typegoose";

const parseArgs = (args) => {
  const newObject = {};
  _.each(args, (value, key) => {
    if (value !== undefined) {
      newObject[key.replace(/___/g, ".")] = value;
    }
  });
  return newObject;
};

@Service()
export class SIS_CourseService {
  constructor(
    @Inject(SIS_Course.collection.collectionName)
    private readonly model: ReturnModelType<typeof SIS_Course>
  ) {}

  async get(id): Promise<typeof SIS_Course> {
    return (await this.model.findOne({ _id: id }).cache())._doc;
  }

  async getCourses(args) {
    const parsed = parseArgs(args);
    return await this.model.find({ "status.code": "ACTIVE", ...parsed });
  }

  async getSubjects() {
    return await this.model.distinct("subjectArea.description", {
      "status.code": "ACTIVE",
    });
  }
}
