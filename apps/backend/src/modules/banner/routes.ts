import type { Application, Request, Response } from "express";
import type { RedisClientType } from "redis";

import { BannerModel } from "@repo/common/models";

import { trackIntensiveClick } from "../click-tracking/controller";
import { bufferTrackingEvents } from "../tracking/controller";

export default (app: Application, redis?: RedisClientType) => {
  // Redirect-based click tracking for all banners
  // This ensures 100% reliable click tracking even if user navigates away immediately
  app.get("/banner/click/:bannerId", async (req: Request, res: Response) => {
    const { bannerId } = req.params;

    try {
      const banner = await BannerModel.findByIdAndUpdate(
        bannerId,
        { $inc: { clickCount: 1 } },
        { new: true }
      );

      if (!banner || !banner.link) {
        // If banner not found or no link, redirect to home
        return res.redirect("/");
      }

      if (redis) {
        // Legacy intensive click tracking (opt-in per banner)
        if (banner.clickEventLogging) {
          trackIntensiveClick(redis, req, bannerId, "banner").catch((error) => {
            console.error("Error tracking banner click event:", error);
          });
        }

        // Unified tracking — always emitted
        bufferTrackingEvents(redis, req, [
          {
            eventType: "click",
            targetType: "banner",
            targetId: bannerId,
            metadata: { version: banner.currentVersion },
            timestamp: new Date().toISOString(),
          },
        ]).catch((error) => {
          console.error("Error buffering banner tracking event:", error);
        });
      }

      // Redirect to the banner's link
      return res.redirect(302, banner.link);
    } catch (error) {
      console.error("Error tracking banner click:", error);
      return res.redirect("/");
    }
  });
};
