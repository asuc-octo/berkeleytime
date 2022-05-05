import _ from "lodash";
import { Container, Service, Inject } from "typedi";

import { EXPIRE_TIME_REDIS_KEY } from "#src/config";
import { SIS_Class_Model } from "#src/models/SIS_Class";
import { SIS_Class_Section_Model } from "#src/models/SIS_Class_Section";
import { SIS_Course_Model } from "#src/models/SIS_Course";
import { redisClient } from "#src/services/redis";

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

  ccn = async ({ args }) => {
    const classSection = await SIS_Class_Section_Model.findOne(
      {
        "class.displayName": args.root.displayName,
        "association.primary": true,
      },
      { class: 1, association: 1 }
    );
    const CourseControlNbr =
      classSection.association.primaryAssociatedSectionId;
    return CourseControlNbr;
  };

  sample = async () => {
    return await this.model.aggregate([{ $sample: { size: 100 } }]);
  };

  semesters = async () => {
    const pipeline: any = [
      { $match: { "status.code": "ACTIVE" } },
      {
        $lookup: {
          from: "sis_class",
          localField: "identifiers.id",
          foreignField: "course.identifiers.id",
          as: "classes",
        },
      },
      { $unwind: "$classes" },
      { $group: { _id: "$classes.session.term" } },
      { $sort: { "_id.id": 1 } },
      { $project: { _id: 0, id: "$_id.id", name: "$_id.name" } },
    ];
    const key = JSON.stringify(pipeline);
    const cached = await redisClient.get(key);
    if (cached) {
      return JSON.parse(cached);
    }

    const res = (await SIS_Course_Model.aggregate(pipeline)).map(
      (doc) => doc.name
    );
    redisClient.set(key, JSON.stringify(res), { EX: EXPIRE_TIME_REDIS_KEY });
    return res;
  };
}

Container.set(SIS_Class_Model.collection.collectionName, SIS_Class_Model);
export const SIS_ClassService = Container.get(service);
