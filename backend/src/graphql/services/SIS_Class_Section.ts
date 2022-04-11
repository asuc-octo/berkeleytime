import _ from "lodash";
import { Container, Service, Inject } from "typedi";

import { SIS_Class_Section_Model } from "#src/models/SIS_Class_Section";
import { SIS_ClassService } from "#src/graphql/services/SIS_Class";

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
          'class.session.term.id': args.root.session.term.id,
          'association.primaryAssociatedSectionId': await SIS_ClassService.ccn({ args: { root: args.root }}),
        },
        { ...projection, id: 1, association: 1 }
      );;
    }
  };
}

Container.set(
  SIS_Class_Section_Model.collection.collectionName,
  SIS_Class_Section_Model
);
export const SIS_Class_SectionService = Container.get(service);
