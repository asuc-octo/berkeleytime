import mongoose, { Schema, InferSchemaType } from "mongoose";

export const UserSchema = new Schema({
  _id: Schema.Types.ObjectId,
  _created: String,
  _updated: String,
  _version: Number,
  access_token: String,
  bio: String,
  email: String,
  google_id: String,
  notify_update_classes: Boolean,
  notify_update_grades: Boolean,
  notify_update_berkeleytime: Boolean,
  classes_saved: [String],
  classes_watching: [String],
  friends: [String],
});

export const UserModel = mongoose.model("user", UserSchema, "user");
export type UserType = InferSchemaType<typeof UserSchema>;
