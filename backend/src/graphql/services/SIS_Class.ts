import _ from "lodash";
import { Container, Service, Inject } from "typedi";

import { SIS_Class_Model } from "#src/models/SIS_Class";

import { ReturnModelType } from "@typegoose/typegoose";

@Service()
class service {
  constructor(
    @Inject(SIS_Class_Model.collection.collectionName)
    private readonly model: ReturnModelType<typeof SIS_Class_Model>
  ) {
    this.model = SIS_Class_Model;
  }

  get = async (id): Promise<typeof SIS_Class_Model> => {
    return await this.model.findOne({ _id: id });
  };

  sample = async () => {
    return await this.model.aggregate([{ $sample: { size: 100 } }]);
  };
}

Container.set(SIS_Class_Model.collection.collectionName, SIS_Class_Model);
export const SIS_ClassService = Container.get(service);
