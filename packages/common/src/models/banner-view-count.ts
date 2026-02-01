import { Model, Schema, model } from "mongoose";

export interface IBannerViewCount {
  bannerId: string;
  viewCount: number;
}

const bannerViewCountSchema = new Schema<IBannerViewCount>({
  bannerId: { type: String, required: true, unique: true },
  viewCount: { type: Number, default: 0 },
});

bannerViewCountSchema.index({ bannerId: 1 }, { unique: true });

export const BannerViewCountModel: Model<IBannerViewCount> =
  model<IBannerViewCount>("bannerviewcounts", bannerViewCountSchema);
