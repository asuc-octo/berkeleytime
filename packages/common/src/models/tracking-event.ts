import { Model, Schema, model } from "mongoose";

export interface ITrackingEvent {
  eventType: string;
  targetType: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
  sessionId: string;
  userId?: string;
  timestamp: Date;
  ipHash: string;
  userAgent?: string;
  referrer?: string;
}

const trackingEventSchema = new Schema<ITrackingEvent>({
  eventType: { type: String, required: true },
  targetType: { type: String, required: true },
  targetId: { type: String },
  metadata: { type: Schema.Types.Mixed },
  sessionId: { type: String, required: true },
  userId: { type: String },
  timestamp: { type: Date, required: true, default: Date.now },
  ipHash: { type: String, required: true },
  userAgent: { type: String, maxlength: 500 },
  referrer: { type: String },
});

// Query by event + target type (e.g. "all search events for courses")
trackingEventSchema.index({ eventType: 1, targetType: 1, timestamp: -1 });
// Query by specific target (e.g. "all events for banner X")
trackingEventSchema.index({ targetId: 1, timestamp: -1 });
// Query by session (reconstruct a user journey)
trackingEventSchema.index({ sessionId: 1, timestamp: -1 });
// Query by user (all events for a logged-in user)
trackingEventSchema.index({ userId: 1, timestamp: -1 }, { sparse: true });

export const TrackingEventModel: Model<ITrackingEvent> = model<ITrackingEvent>(
  "trackingevents",
  trackingEventSchema
);
