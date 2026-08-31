import type { Application, Request, Response } from "express";
import type { RedisClientType } from "redis";

import { NavItemModel } from "@repo/common/models";

import { bufferTrackingEvents } from "../tracking/controller";

export default (app: Application, redis?: RedisClientType) => {
  // Redirect-based click tracking for nav items
  // This ensures 100% reliable click tracking even if user navigates away immediately
  app.get("/nav-item/click/:navItemId", async (req: Request, res: Response) => {
    const { navItemId } = req.params;

    try {
      const navItem = await NavItemModel.findByIdAndUpdate(
        navItemId,
        { $inc: { clickCount: 1 } },
        { new: true }
      );

      if (!navItem || !navItem.url) {
        // If nav item not found or no url, redirect to home
        return res.redirect("/");
      }

      if (redis) {
        bufferTrackingEvents(redis, req, [
          {
            eventType: "click",
            targetType: "nav-item",
            targetId: navItemId,
            metadata: { label: navItem.label, url: navItem.url },
            timestamp: new Date().toISOString(),
          },
        ]).catch((error) => {
          console.error("Error buffering nav item tracking event:", error);
        });
      }

      // Redirect to the nav item's url
      return res.redirect(302, navItem.url);
    } catch (error) {
      console.error("Error tracking nav item click:", error);
      return res.redirect("/");
    }
  });
};
