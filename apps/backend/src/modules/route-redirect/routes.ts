import type { Application, Request, Response } from "express";
import type { RedisClientType } from "redis";

import { RouteRedirectModel } from "@repo/common/models";

import { trackIntensiveClick } from "../click-tracking/controller";

export default (app: Application, redis?: RedisClientType) => {
  // Server-side redirect handler for snappy redirects
  // Catches /go/:path paths and redirects to the configured destination
  app.get("/go/:path", async (req: Request, res: Response) => {
    // Extract the path (e.g., /go/donate → /donate)
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

      // Track click event if enabled and redis is available
      if (redirect.clickEventLogging && redis) {
        trackIntensiveClick(
          redis,
          req,
          redirect._id.toString(),
          "redirect"
        ).catch((error) => {
          console.error("Error tracking redirect click event:", error);
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
