import _ from "lodash";
import { Service, Inject } from "typedi";

import { SIS_Class } from "#src/models/_index";

import { ReturnModelType } from "@typegoose/typegoose";

@Service()
export class SIS_ClassService {
  constructor(
    @Inject(SIS_Class.collection.collectionName)
    private readonly model: ReturnModelType<typeof SIS_Class>
  ) {}

  async get(id): Promise<typeof SIS_Class> {
    return (await this.model.findOne({ _id: id }).cache())._doc;
  }

  async getAll() {
    return await this.model.find().limit(100);
  }
}
