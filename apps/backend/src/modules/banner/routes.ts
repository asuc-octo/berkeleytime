import type { Application, Request, Response } from "express";

import { BannerModel } from "@repo/common";

export default (app: Application) => {
  // Redirect-based click tracking for highMetrics banners
  // This ensures 100% reliable click tracking even if user navigates away immediately
  app.get("/api/banner/click/:bannerId", async (req: Request, res: Response) => {
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

      // Redirect to the banner's link
      return res.redirect(302, banner.link);
    } catch (error) {
      console.error("Error tracking banner click:", error);
      return res.redirect("/");
    }
  });
};
