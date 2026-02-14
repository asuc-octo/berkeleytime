import { Model, Schema, Types, model } from "mongoose";

export interface IClickEvent {
  targetId: Types.ObjectId;
  targetType: "banner" | "redirect" | "targeted-message";
  targetVersion?: number; // Banner version at time of click (for version correlation)
  additionalInfo?: string; // Optional context (e.g., courseId)
  timestamp: Date;
  ipHash: string;
  userAgent?: string;
  referrer?: string;
  sessionFingerprint: string;
  userId?: string;
}

const clickEventSchema = new Schema<IClickEvent>({
  targetId: { type: Schema.Types.ObjectId, required: true },
  targetType: {
    type: String,
    enum: ["banner", "redirect", "targeted-message"],
    required: true,
  },
  targetVersion: { type: Number }, // version at time of click
  additionalInfo: { type: String },
  timestamp: { type: Date, required: true, default: Date.now },
  ipHash: { type: String, required: true },
  userAgent: { type: String, maxlength: 500 },
  referrer: { type: String },
  sessionFingerprint: { type: String, required: true },
  userId: { type: String },
});

clickEventSchema.index({ targetId: 1, timestamp: -1 });
clickEventSchema.index({ targetType: 1, timestamp: -1 });
// Index for version-based analytics queries (clicks by version)
clickEventSchema.index({ targetId: 1, targetVersion: 1, timestamp: -1 });
clickEventSchema.index({ additionalInfo: 1, timestamp: -1 });
clickEventSchema.index({ userId: 1, timestamp: -1 }, { sparse: true });

export const ClickEventModel: Model<IClickEvent> = model<IClickEvent>(
  "clickevents",
  clickEventSchema
);
