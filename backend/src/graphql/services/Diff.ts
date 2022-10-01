import _ from "lodash";
import { Container, Service, Inject } from "typedi";

import { SIS_Class_Section_Model } from "#src/models/SIS_Class_Section";
import { DiffType } from "#src/models/subtypes";

@Service()
class service {
  constructor(
    @Inject("Diff")
    private readonly asdf: DiffType
  ) {}

  diffs = async ({ args }) => {
    if (args.CourseControlNbr && args.term.year && args.term.semester) {
      const collectionId = (
        await SIS_Class_Section_Model.findOne({
          id: args.CourseControlNbr,
          displayName: RegExp(
            `${args.term.year ?? ""} ${args.term.semester ?? ""}`
          ),
        })
      )._id;

      //@ts-ignore
      return await SIS_Class_Section_Model.history
        .find({ collectionId })
        .sort({ createdAt: "desc" })
        .allowDiskUse(true)
        .cache();
    } else {
      const [sectionYear, sectionSemester] = args.root.displayName.split(" ");
      const collectionIds = await SIS_Class_Section_Model.find(
        {
          id: args.root.id,
          displayName: RegExp(
            `${args.term.year ?? ""} ${args.term.semester ?? ""}`
          ),
        },
        { _id: 1 }
      );

      //@ts-ignore
      return await SIS_Class_Section_Model.history.aggregate([
        {
          $match: {
            $or: collectionIds.map((o) => ({ collectionId: o._id })),
          },
        },
        {
          $sort: {
            createdAt: -1,
          },
        },
      ]);
    }
  };
}

Container.set("Diff", DiffType);
export const DiffService = Container.get(service);
