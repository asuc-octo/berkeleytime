import { Model, Schema, Types, model } from "mongoose";

export interface IClickEvent {
  targetId: Types.ObjectId;
  targetType: "banner" | "redirect";
  timestamp: Date;
  ipHash: string;
  userAgent?: string;
  referrer?: string;
  sessionFingerprint: string;
}

const clickEventSchema = new Schema<IClickEvent>({
  targetId: { type: Schema.Types.ObjectId, required: true },
  targetType: { type: String, enum: ["banner", "redirect"], required: true },
  timestamp: { type: Date, required: true, default: Date.now },
  ipHash: { type: String, required: true },
  userAgent: { type: String, maxlength: 500 },
  referrer: { type: String },
  sessionFingerprint: { type: String, required: true },
});

clickEventSchema.index({ targetId: 1, timestamp: -1 });
clickEventSchema.index({ targetType: 1, timestamp: -1 });

export const ClickEventModel: Model<IClickEvent> = model<IClickEvent>(
  "clickevents",
  clickEventSchema
);
