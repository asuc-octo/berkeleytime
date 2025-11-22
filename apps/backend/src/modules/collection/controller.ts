import {
  ClassModel,
  IClassItem,
  UserModel,
  CollectionModel,
  CollectionType,
} from "@repo/common";

import { UpdateUserInput } from "../../generated-types/graphql";
import { formatClass } from "../class/formatter";
import { formatCourse } from "../course/formatter";
import { formatUser } from "../user/formatter";

export const getCollectionOwner = async (context: any) => {
  const query = await CollectionModel.find({ownerID: context.user._id})

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

export const addClassToCollection = async (input: any) => {
  const classDoc = await findClassByDescriptor(input.class);

  if (!query) throw new Error("Not found");
  if (!classDoc) throw new Error("Class not found");

  return formatCollection(query);

}
const formatCollection = async (collections: CollectionType[]) => {
  const collectionNameNClassesNComments = collections.map((collection) => {
    name: collection.name,
    classes: await formatCollectionClasses(collection),
    comments: await formatCollectionComments(collection),
const findCollectionClassEntry = (
  collection: CollectionType,
  descriptor: CollectionClassInput
) => {
  const normalized = normalizeClassInput(descriptor);

  return collection.classes.find((entry) => {
    const info = entry.info as CollectionClassInput;

    return (
      info.year === normalized.year &&
      info.semester === normalized.semester &&
      (info.sessionId ?? "1") === normalized.sessionId &&
      info.subject === normalized.subject &&
      info.courseNumber === normalized.courseNumber &&
      info.number === normalized.number
    );
  });
  return collectionNameNClassesNComments;
};

const formatCollectionClasses = async (collection: CollectionType) => {
  const classes: IClassItem[] = [];
  if (!collection.classes) return classes;
  
  for (const _class of collection.classes) {
    const __class = await ClassModel.findOne({
      year: _class.year,
      semester: _class.semester,
      // sessionId: _class.sessionId ? _class.sessionId : "1",
      subject: _class.subject,
      courseNumber: _class.courseNumber,
      number: _class.number,
    }).lean();
export const addCommentToCollectionClass = async (
  input: AddCollectionCommentInput
) => {
  const collection = await findCollectionOrThrow(
    input.ownerID,
    input.collectionName
  );

    if (!_class) continue;
  const entry = findCollectionClassEntry(collection as CollectionType, input.class);

    classes.push(__class as IClassItem);
  }
  if (!entry) throw new Error("Class not found in collection");

  entry.comments = [...(entry.comments ?? []), input.comment];

  return classes;
  await collection.save();

  return formatCollection(collection as CollectionType);
};

const formatCollectionComments = async (collection: CollectionType) => {
  const comments: String[] = [];
  if (!collection.classes) return comments;
  for (const _class of collection.classes) {
    const comment = _class.comments ? _class.comments : [""]
export const deleteCommentFromCollectionClass = async (
  input: DeleteCollectionCommentInput
) => {
  const collection = await findCollectionOrThrow(
    input.ownerID,
    input.collectionName
  );

  const entry = findCollectionClassEntry(collection as CollectionType, input.class);

  if (!entry) throw new Error("Class not found in collection");

  entry.comments = (entry.comments ?? []).filter(
    (comment) => comment !== input.comment
  );

    comments.push(comment);
  }
  await collection.save();

  return comments;
  return formatCollection(collection as CollectionType);
};
