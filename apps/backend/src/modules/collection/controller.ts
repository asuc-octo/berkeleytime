import {
  ClassModel,
  IClassItem,
  CollectionModel,
  CollectionType,
} from "@repo/common";

export const getCollectionOwner = async (context: any) => {
  const query = await CollectionModel.find({ownerID: context.user._id})

  if (!query) throw new Error("Not found");

  return formatCollection(query);
};

export const getCollectionViewer = async (context: any) => {
  const query = await CollectionModel.find({viewerID: context.user._id})

  if (!query) throw new Error("Not found");

  return formatCollection(query);
};

export const createCollection = async (input: any) => {
  const collection = await CollectionModel.create({
    ownerID: input.ownerID,
    viewerIDs: [],
    name: input.name,
    classes: [],
  });

  return collection;
};

const formatCollection = async (collections: CollectionType[]) => {
  const collectionNameNClassesNComments = [];
  if (collections.length < 1) return [];

  for (const collection of collections) {
    const collectionInfo = {
        ownerID: collection.ownerID,
        viewerID: collection.viewerID,
        name: collection.name,
        classes: await formatCollectionClasses(collection),
    };
    collectionNameNClassesNComments.push(collectionInfo);
  }
  return collectionNameNClassesNComments
};

const formatCollectionClasses = async (collection: CollectionType) => {
  const classes = [];
  if (!collection.classes) return [];
  
  for (const item of collection.classes) {
    const _class = await ClassModel.findOne({
      year: item.year,
      semester: item.semester,
      // sessionId: item.sessionId ? item.sessionId : "1",
      subject: item.subject,
      courseNumber: item.courseNumber,
      number: item.number,
    }).lean();

    if (!_class) continue;

    const comments = item.comments ? item.comments : [];
    classes.push({info: _class as IClassItem, comments: comments});
  }

  return classes;
};

export const addClassToCollection = async (input: CollectionModel.AddCollectionClassInput) => {
  const collection = await CollectionModel.findOne({
    ownerID: input.ownerID,
    name: input.name,
  });
  if (!collection) throw new Error("not found by owner and name");
  const info = await ClassModel.findOne({
    year: input.year,
    semester: input.semester,
    sessionId: input.sessionId ? input.sessionId : "1",
    subject: input.subject,
    courseNumber: input.courseNumber,
    number: input.number,
  }).lean();
  const _class = {info: info as IClassItem, comments: []};
  collection.classes?.push(_class);
  await collection.save();

  return;
}

export const modifyCollectionComment = async (input: CollectionModel.modifyCollectionCommentInput) => {
  const collection = await CollectionModel.findOne({
    ownerID: input.ownerID,
    name: input.name,
  });
  if (!collection) throw new Error("Collection not found");

  const entry = collection.classes?.find((_class) => {
    return (
      _class.year === input.year &&
      _class.semester === input.semester &&
      _class.subject === input.subject &&
      _class.courseNumber === input.courseNumber &&
      _class.number === input.number
    );
  });
  if (!entry) throw new Error("Class not found in collection");

  entry.comments = entry.comments ?? [];
  if (input.add) {
    entry.comments.push(input.comment);
  } else {
    entry.comments = entry.comments.filter((comment) => comment !== input.comment);
  }

  await collection.save();
};
