import mongoose, { Schema, InferSchemaType, Types } from "mongoose";

export const UserSchema = new Schema({
    _id: { type: Types.ObjectId, required: true },
    _created: String,
    _updated: String,
    _version: Number,
    access_token: String,
    bio: String,
    email: String,
    name: String,
    google_id: String,
    notify_update_classes: Boolean,
    notify_update_grades: Boolean,
    notify_update_berkeleytime: Boolean,
    classes_saved: [String],
    classes_watching: [String],
    majors: [String],
    friends: [String],
    schedules: [String]
});

export const UserModel = mongoose.model("user", UserSchema, "user");
export type UserType = InferSchemaType<typeof UserSchema>;
