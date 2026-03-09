import { Model, Schema, model } from "mongoose";

export interface IBannerViewCount {
  bannerId: string;
  viewCount: number;
}

const bannerViewCountSchema = new Schema<IBannerViewCount>({
  bannerId: { type: String, required: true, unique: true },
  viewCount: { type: Number, default: 0 },
});

export const BannerViewCountModel: Model<IBannerViewCount> =
  model<IBannerViewCount>("bannerviewcounts", bannerViewCountSchema);
