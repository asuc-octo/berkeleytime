import _ from "lodash";
import moment from "moment-timezone";
import { Container, Service, Inject } from "typedi";

import { SIS_Class } from "#src/models/SIS_Class";

import { ReturnModelType } from "@typegoose/typegoose";

@Service()
class service {
  constructor(
    @Inject(SIS_Class.collection.collectionName)
    private readonly model: ReturnModelType<typeof SIS_Class>
  ) {
    this.model = SIS_Class;
  }

  get = async (id): Promise<typeof SIS_Class> => {
    return await this.model.findOne({ _id: id });
  };

  sample = async () => {
    return await this.model.aggregate([{ $sample: { size: 100 } }]);
  };
}

Container.set(SIS_Class.collection.collectionName, SIS_Class);
export const SIS_ClassService = Container.get(service);
