import type { Application, Request, Response } from "express";

import { RouteRedirectModel } from "@repo/common/models";

export default (app: Application) => {
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

      // Immediate redirect to destination
      return res.redirect(302, redirect.toPath);
    } catch (error) {
      console.error("Error processing redirect:", error);
      return res.redirect("/");
    }
  });
};
