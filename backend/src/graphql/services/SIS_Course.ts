import _ from "lodash";
import { Container, Service, Inject } from "typedi";

import { SIS_Class_Model, SIS_Course_Model } from "#src/models/_index";

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
class service {
  constructor(
    @Inject(SIS_Course_Model.collection.collectionName)
    private readonly model: ReturnModelType<typeof SIS_Course_Model>
  ) {}

  get = async (id: Promise<typeof SIS_Course_Model>) => {
    return await this.model.findOne({ _id: id });
  };

  classes = async ({ args, courseId }) => {
    const where = {
      "course.identifiers.id": courseId,
    };
    let expr = `${args.year ?? ""} ${args.semester ?? ""}`;
    if (expr.trim() != "") {
      where["session.term.name"] = RegExp(expr);
    }
    return await SIS_Class_Model.find(where);
  };

  courses = async (args, fieldsProjection) => {
    return _.chain(
      await this.model
        .find(
          {
            "status.code": "ACTIVE",
            ...parseArgs(args),
          },
          {
            _id: 1,
            "identifiers.id": 1,
            "identifiers.type": 1,
            "subjectArea.code": 1,
            "catalogNumber.number": 1,
            ...fieldsProjection,
          }
        )
        .lean()
        .cache()
    )
      .orderBy((o) => parseInt(o.catalogNumber.number))
      .orderBy("subjectArea.code");
  };

  courseNames = async () => {
    return _.orderBy(
      await this.model
        .distinct("displayName", {
          "status.code": "ACTIVE",
        })
        .cache()
    ).sort();
  };

  departmentNames = async () => {
    return _.orderBy(
      await this.model
        .distinct("subjectArea.description", {
          "status.code": "ACTIVE",
        })
        .cache()
    ).sort();
  };

  subjects = async () => {
    return await this.model
      .distinct("subjectArea.description", {
        "status.code": "ACTIVE",
      })
      .cache();
  };
}

Container.set(SIS_Course_Model.collection.collectionName, SIS_Course_Model);
export const SIS_CourseService = Container.get(service);
