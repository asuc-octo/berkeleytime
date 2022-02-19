import _ from "lodash";
import { Service, Inject } from "typedi";

import { SIS_Class_Section } from "#src/models/_index";

import { ReturnModelType } from "@typegoose/typegoose";

@Service()
export class SIS_Class_SectionService {
  constructor(
    @Inject(SIS_Class_Section.collection.collectionName)
    private readonly model: ReturnModelType<typeof SIS_Class_Section>
  ) {}

  async get(id): Promise<typeof SIS_Class_Section> {
    return (await this.model.findOne({ _id: id }).cache())._doc;
  }

  async getAll() {
    return await this.model.find().limit(1);
  }
}
