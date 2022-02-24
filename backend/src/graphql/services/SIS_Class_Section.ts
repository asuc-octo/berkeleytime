import _ from "lodash";
import { Container, Service, Inject } from "typedi";

import { SIS_Class_Section_Model } from "#src/models/SIS_Class_Section";

import { ReturnModelType } from "@typegoose/typegoose";

@Service()
class service {
  constructor(
    @Inject(SIS_Class_Section_Model.collection.collectionName)
    private readonly model: ReturnModelType<typeof SIS_Class_Section_Model>
  ) {}

  sections = async ({ args, projection }) => {
    if (args.id) {
      return await this.model.find({
        id: args.id,
        "class.session.term.name": RegExp(
          `${args.year ?? ""} ${args.semester ?? ""}`
        ),
      });
    } else if (args.root) {
      return await this.model.find(
        {
          "class.displayName": RegExp(`^${args.root.displayName}`),
        },
        { ...projection, id: 1, displayName: 1 }
      );
    }
  };
}

Container.set(
  SIS_Class_Section_Model.collection.collectionName,
  SIS_Class_Section_Model
);
export const SIS_Class_SectionService = Container.get(service);
