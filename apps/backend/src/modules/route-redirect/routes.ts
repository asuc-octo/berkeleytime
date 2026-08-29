import type { Application, Request, Response } from "express";
import type { RedisClientType } from "redis";

import { RouteRedirectModel } from "@repo/common/models";

import { trackIntensiveClick } from "../click-tracking/controller";
import { bufferTrackingEvents } from "../tracking/controller";

export default (app: Application, redis?: RedisClientType) => {
  // Server-side redirect handler for snappy redirects
  // Catches /go/* paths and redirects to the configured destination
  // Uses wildcard (*path) to capture multi-segment paths (e.g., /go/donate/campaign)
  app.get("/go/*path", async (req: Request, res: Response) => {
    // Extract the path (e.g., /go/donate/campaign → /donate/campaign)
    const fromPath = "/" + req.params.path;

    try {
      const redirect = await RouteRedirectModel.findOneAndUpdate(
        { fromPath },
        { $inc: { clickCount: 1 } },
        { new: true }
      );

      if (!redirect || !redirect.toPath) {
        // No matching redirect found, send to home
        return res.redirect("/");
      }

      if (redis) {
        // Legacy intensive click tracking (opt-in per redirect)
        if (redirect.clickEventLogging) {
          trackIntensiveClick(
            redis,
            req,
            redirect._id.toString(),
            "redirect"
          ).catch((error) => {
            console.error("Error tracking redirect click event:", error);
          });
        }

        // Unified tracking — always emitted
        bufferTrackingEvents(redis, req, [
          {
            eventType: "click",
            targetType: "redirect",
            targetId: redirect._id.toString(),
            metadata: { fromPath, toPath: redirect.toPath },
            timestamp: new Date().toISOString(),
          },
        ]).catch((error) => {
          console.error("Error buffering redirect tracking event:", error);
        });
      }

      // Immediate redirect to destination
      return res.redirect(302, redirect.toPath);
    } catch (error) {
      console.error("Error processing redirect:", error);
      return res.redirect("/");
    }
  });
};
