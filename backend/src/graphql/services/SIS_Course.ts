import _ from "lodash";
import { Service, Inject } from "typedi";

import { SIS_Course } from "#src/models/_index";

import { ReturnModelType } from "@typegoose/typegoose";

@Service()
export class SIS_CourseService {
  constructor(
    @Inject(SIS_Course.collection.collectionName)
    private readonly model: ReturnModelType<typeof SIS_Course>
  ) {}

  async get(id): Promise<typeof SIS_Course> {
    return (await this.model.findOne({ _id: id }).cache())._doc;
  }

  async getAll() {
    return await this.model.find({ "credit.type": "discrete" }).limit(1);
  }
}
