import { Document, Model, Schema, model } from "mongoose";

export interface IDiscussionItem {
  subject: string;
  courseNumber: string;

  comments: {
    comment: string;
    createdBy: string;
  }[];
}

// export interface IDiscussionSingularItem
//   extends Omit<IDiscussionItem, "comments"> {
//   data: IDiscussionItem["comments"][0];
// }

export interface IDiscussionItemDocument
  extends IDiscussionItem,
    Document {}

const discussionSchema = new Schema<IDiscussionItem>({
  courseNumber: { type: String, required: true },
  subject: { type: String, required: true },

  comments: [
    {
      _id: { type: Schema.Types.ObjectId, auto: true },
      comment: { type: String, required: true },
      createdBy: { type: String, required: true }
    }
  ],
} , {timestamps: true});

discussionSchema.index(
  { courseNumber: 1 , subject: 1 },
  { unique: true }
);

export const NewDiscussionModel: Model<IDiscussionItem> =
  model<IDiscussionItem>("discussions", discussionSchema);
