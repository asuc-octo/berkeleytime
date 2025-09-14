import { Schema, model, Model } from "mongoose";

export interface IDiscussionItem {
  subject: string;
  courseNumber: string;

  comment:string;
  createdBy: string;
  createdAt: NativeDate;
  updatedAt: NativeDate;
}

// export interface IDiscussionSingularItem
//   extends Omit<IDiscussionItem, "comments"> {
//   data: IDiscussionItem["comments"][0];
// }

// export interface IDiscussionItemDocument
//   extends IDiscussionItem,
//     Document {}

const discussionSchema = new Schema<IDiscussionItem>({
  courseNumber: { type: String, required: true },
  subject: { type: String, required: true },

  comment: { type: String, required: true },
  createdBy: { type: String, required: true }
} , {timestamps: true});

// discussionSchema.index(
//   { courseNumber: 1 , subject: 1 },
//   // { unique: true }
// );

// discussionSchema.index(
//   { courseNumber: 1 , subject: 1, createdBy: 1, createdAt: 1 },
//   { unique: true }
// );

export const NewDiscussionModel: Model<IDiscussionItem> =
  model<IDiscussionItem>("discussions", discussionSchema);
