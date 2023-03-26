import mongoose, { Schema, InferSchemaType, Document } from "mongoose";

export const UserSchema = new Schema({
    google_id: {
        type: String,
        trim: true,
        required: true,
        immutable: true,
        select: false,
    },
    email: {
        type: String,
        trim: true,
        required: true,
        immutable: true,
    },
    username: {
        type: String,
        trim: true,
        required: true,
    },
    first_name: {
        type: String,
        trim: true,
        required: true,
    },
    last_name: {
        type: String,
        trim: true,
        required: true,
    },
    major: {
        type: [String],
        trim: true,
        required: true,
        default: [],
    },
    last_login: {
        type: Date,
        trim: true,
        required: true,
        default: Date.now,
    },
    is_staff: {
        type: Boolean,
        required: true,
        default: false,
    },
    is_active: {
        type: Boolean,
        required: true,
        default: true,
    },
    email_class_update: {
        type: Boolean,
        required: true,
        default: false,
    },
    email_grade_update: {
        type: Boolean,
        required: true,
        default: false,
    },
    email_enrollment_opening: {
        type: Boolean,
        required: true,
        default: false,
    },
    email_berkeleytime_update: {
        type: Boolean,
        required: true,
        default: false,
    },
    refresh_token: {
        type: String,
        trim: true,
        required: false,
        select: false,
    },
}, { timestamps: true });

export const UserModel = mongoose.model("user", UserSchema, "user");
export type UserType = Document & InferSchemaType<typeof UserSchema>;
