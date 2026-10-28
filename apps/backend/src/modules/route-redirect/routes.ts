import type { Application, Request, Response } from "express";
import type { RedisClientType } from "redis";

import { RouteRedirectModel } from "@repo/common/models";

import { bufferTrackingEvents } from "../tracking/ingest";

export default (app: Application, redis?: RedisClientType) => {
  // Server-side redirect handler for snappy redirects
  // Catches /go/* paths and redirects to the configured destination
  // Uses wildcard (*path) to capture multi-segment paths (e.g., /go/donate/campaign)
  app.get("/go/{*path}", async (req: Request, res: Response) => {
    // Extract the path (e.g., /go/donate/campaign → /donate/campaign)
    const segments = req.params.path;
    const fromPath =
      "/" + (Array.isArray(segments) ? segments.join("/") : segments || "");

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

      // Check configured internal chains before navigation. RootWrapper runs
      // again after every full navigation, so its in-memory guard is insufficient.
      const base = new URL(`${req.protocol}://${req.get("host")}`);
      const visited = new Set([fromPath]);
      let destination = redirect.toPath;
      for (let hop = 0; hop < 10; hop++) {
        const url = new URL(destination, base);
        if (url.host !== base.host) break;
        const path = url.pathname.startsWith("/go/")
          ? "/" +
            url.pathname.slice(4).split("/").map(decodeURIComponent).join("/")
          : url.pathname;
        if (visited.has(path))
          return res.status(508).send("This link has a redirect loop.");
        visited.add(path);
        const next = await RouteRedirectModel.findOne({
          fromPath: path,
        }).lean();
        if (!next?.toPath) break;
        if (hop === 9)
          return res.status(508).send("This link has too many redirects.");
        destination = next.toPath;
      }

      if (redis) {
        bufferTrackingEvents(
          redis,
          req,
          [
            {
              eventType: "click",
              targetType: "redirect",
              targetId: redirect._id.toString(),
              metadata: { fromPath, toPath: redirect.toPath },
              timestamp: new Date().toISOString(),
            },
          ],
          "server-redirect"
        ).catch((error) => {
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
