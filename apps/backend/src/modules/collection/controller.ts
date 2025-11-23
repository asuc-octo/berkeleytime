import {
  ClassModel,
  CollectionModel,
  CollectionType,
  IClassItem,
} from "@repo/common";
import { CollectionModule } from "./generated-types/module-types";
export const getCollectionOwner = async (ownerID: string) => {
  const collections = await CollectionModel.find({
    ownerID,
  });

  if (!collections?.length) return [];

  return formatCollections(collections as CollectionType[]);
};

export const getCollectionViewer = async (viewerID: string) => {
  const collections = await CollectionModel.find({
    viewerID,
  });

  if (!collections?.length) return [];

  return formatCollections(collections as CollectionType[]);
};

export const createCollection = async (input: any) => {
  const collection = await CollectionModel.create({
    ownerID: input.ownerID,
    viewerID: [],
    name: input.name,
    classes: [],
  });

  return (await formatCollections([collection as CollectionType]))[0];
};

const formatCollections = async (collections: CollectionType[]) => {
  return Promise.all(
    collections.map(async (collection) => ({
      ownerID: collection.ownerID,
      viewerID: collection.viewerID ?? [],
      name: collection.name,
      classes: await formatCollectionClasses(collection),
    }))
  );
};

const formatCollectionClasses = async (collection: CollectionType) => {
  const classes = [];
  if (!collection.classes) return [];

  for (const item of collection.classes) {
    const _class = await ClassModel.findOne({
      year: item.info?.year,
      semester: item.info?.semester,
      sessionId: item.info?.sessionId ? item.info?.sessionId : "1",
      subject: item.info?.subject,
      courseNumber: item.info?.courseNumber,
      number: item.info?.number,
    }).lean();

    if (!_class) continue;

    const comments = item.comments ? item.comments : [];
    classes.push({ info: _class as IClassItem, comments: comments });
  }

  return classes;
};
export const addClassToCollection = async (
  input: CollectionModule.AddCollectionClassInput
) => {
  const collection = await CollectionModel.findOne({
    ownerID: input.ownerID,
    name: input.name,
  });
  if (!collection) throw new Error("not found by owner and name");

  const alreadyExists = collection.classes?.some((entry) => {
    const info = entry.info;

    return (
      info?.year === input.class.year &&
      info?.semester === input.class.semester &&
      (info?.sessionId ?? "1") === (input.class.sessionId ?? "1") &&
      info?.subject === input.class.subject &&
      info?.courseNumber === input.class.courseNumber &&
      info?.number === input.class.number
    );
  });

  if (alreadyExists) throw new Error("Class already exists in collection");
  /*
  const info = await ClassModel.findOne({
    year: input.year,
    semester: input.semester,
    sessionId: input.sessionId ? input.sessionId : "1",
    subject: input.subject,
    courseNumber: input.courseNumber,
    number: input.number,
  }).lean();
  const _class = { info: info as IClassItem, comments: [] }; */
  const _class = {
    info: {
      year: input.class.year,
      semester: input.class.semester,
      sessionId: input.class.sessionId ?? "1",
      subject: input.class.subject,
      courseNumber: input.class.courseNumber,
      number: input.class.number,
    },
    comments: [],
  };
  collection.classes?.push(_class);
  await collection.save();

  return (await formatCollections([collection as CollectionType]))[0];
};

export const modifyCollectionComment = async (
  input: CollectionModule.modifyCollectionCommentInput
) => {
  const collection = await CollectionModel.findOne({
    ownerID: input.ownerID,
    name: input.name,
  });
  if (!collection) throw new Error("Collection not found");

  const entry = collection.classes?.find((_class) => {
    return (
      _class.info?.year === input.class.year &&
      _class.info?.semester === input.class.semester &&
      (_class.info?.sessionId ?? "1") === (input.class.sessionId ?? "1") &&
      _class.info?.subject === input.class.subject &&
      _class.info?.courseNumber === input.class.courseNumber &&
      _class.info?.number === input.class.number
    );
  });
  if (!entry) throw new Error("Class not found in collection");

  entry.comments = entry.comments ?? [];
  if (input.add) {
    entry.comments.push(input.comment);
  } else {
    entry.comments = entry.comments.filter(
      (comment) => comment !== input.comment
    );
  }

  await collection.save();
  return (await formatCollections([collection as CollectionType]))[0];
};
