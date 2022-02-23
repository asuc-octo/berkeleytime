import _ from "lodash";
import { Container, Service, Inject } from "typedi";

import { SIS_Class_Section } from "#src/models/SIS_Class_Section";

import { ReturnModelType } from "@typegoose/typegoose";

@Service()
class service {
  constructor(
    @Inject(SIS_Class_Section.collection.collectionName)
    private readonly model: ReturnModelType<typeof SIS_Class_Section>
  ) {}

  get = async (args) => {
    return await this.model.find({
      id: args.id,
      "class.session.term.name": RegExp(`^${args.year} ${args.semester}`),
    });
  };
}

Container.set(SIS_Class_Section.collection.collectionName, SIS_Class_Section);
export const SIS_Class_SectionService = Container.get(service);
