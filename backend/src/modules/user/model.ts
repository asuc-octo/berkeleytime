import mongoose, { Schema, InferSchemaType, Document } from "mongoose";

export const UserSchema = new Schema({
    google_id: { type: String, required: true },
    last_login: { type: String, required: true },
    is_superuser: { type: Boolean, required: false },
    username: { type: String, required: true },
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    email: { type: String, required: true },
    is_staff: { type: Boolean, required: true, default: false },
    is_active: { type: Boolean, required: true, default: true },
    major: { type: [String], required: false },
    email_class_update: { type: Boolean, required: false },
    email_grade_update: { type: Boolean, required: false },
    email_enrollment_opening: { type: Boolean, required: false },
    email_berkeleytime_update: { type: Boolean, required: false },
    refresh_token: { type: String, required: false },
}, { timestamps: true });

export const UserModel = mongoose.model("user", UserSchema, "user");
export type UserType = Document & InferSchemaType<typeof UserSchema>;
