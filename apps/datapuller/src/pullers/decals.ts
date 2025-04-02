import {
  ClassModel,
  DecalModel,
  IDecal,
  SectionModel,
  TermModel,
} from "@repo/common";

import { getDecals } from "../lib/decals";

// TODO: Logs
export const updateDecals = async () => {
  const currentTerm = await TermModel.findOne({
    temporalPosition: "Current",
  }).lean();

  if (!currentTerm) return;

  const primarySections = await SectionModel.find({
    termId: currentTerm.id,
    primary: true,
  }).lean();

  const classes = await ClassModel.find({
    termId: currentTerm.id,
  }).lean();

  const [year, semester] = currentTerm.name.split(" ");
  const decals = await getDecals(`${semester}+${year}`);

  const filteredDecals = decals.reduce((acc, decal) => {
    const section = decal.sections?.find((section) => section.ccn);

    // Match by primary section CCN
    section: if (section) {
      const filteredPrimarySections = primarySections.filter(
        (primarySection) => primarySection.number === section.ccn
      );

      if (filteredPrimarySections.length === 0) break section;

      const primarySection = filteredPrimarySections[0];

      acc.push({
        subject: primarySection.subject,
        courseNumber: primarySection.courseNumber,
        number: primarySection.number,
        year,
        semester,
        termId: currentTerm.id,
        title: decal.title,
        externalId: decal.id,
        category: decal.category,
        units: decal.units,
        date: decal.date,
        description: decal.description,
        website: decal.website,
        application: decal.application,
        enroll: decal.enroll,
        contact: decal.contact,
      });

      return acc;
    }

    // Match by class title
    const filteredClasses = classes.filter((_class) => {
      return (
        _class.title === decal.title || _class.title === `${decal.title} DeCal`
      );
    });

    if (filteredClasses.length === 0) return acc;

    const filteredClass = filteredClasses[0];

    acc.push({
      subject: filteredClass.subject,
      courseNumber: filteredClass.courseNumber,
      number: filteredClass.number,
      year,
      semester,
      termId: currentTerm.id,
      title: decal.title,
      externalId: decal.id,
      category: decal.category,
      units: decal.units,
      date: decal.date,
      description: decal.description,
      website: decal.website,
      application: decal.application,
      enroll: decal.enroll,
      contact: decal.contact,
    });

    return acc;
  }, [] as IDecal[]);

  if (filteredDecals.length === 0) return;

  await DecalModel.deleteMany({
    termId: currentTerm.id,
  });

  await DecalModel.insertMany(filteredDecals, {
    ordered: false,
  });
};
