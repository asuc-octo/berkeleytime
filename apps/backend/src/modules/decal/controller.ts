import { ClassModel, DecalModel, IClassItem } from "@repo/common";

import { formatClassForDecal } from "./formatter";

// semester and year
export const getDecalsByYearSemester = async (
  semester: string,
  year: string
) => {
  const decals = await DecalModel.find({ semester, year });

  const decalsClass = await Promise.all(
    decals.map(async (decal) => {
      if (
        !decal.subject ||
        !decal.courseNumber ||
        !decal.semester ||
        !decal.year
      ) {
        return {
          ...decal.toObject(),
          _id: decal._id.toString(),
          class: null,
        };
      }

      const matchedClassDoc = await ClassModel.findOne({
        subject: decal.subject,
        courseNumber: decal.courseNumber,
        semester: decal.semester,
        year: parseInt(decal.year),
      });

      return {
        ...decal.toObject(),
        _id: decal._id.toString(),
        class: matchedClassDoc
          ? formatClassForDecal(matchedClassDoc as IClassItem)
          : null,
      };
    })
  );

  return decalsClass;
};
