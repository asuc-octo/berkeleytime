import type { Application, Request, Response } from "express";
import type { RedisClientType } from "redis";

import { TargetedMessageModel } from "@repo/common/models";

import { trackIntensiveClick } from "../click-tracking/controller";

export default (app: Application, redis?: RedisClientType) => {
  // Redirect-based click tracking for targeted messages
  app.get("/message/click/:messageId", async (req: Request, res: Response) => {
    const { messageId } = req.params;
    const courseIdParam =
      typeof req.query.courseId === "string" ? req.query.courseId : undefined;

    try {
      const message = await TargetedMessageModel.findByIdAndUpdate(
        messageId,
        { $inc: { clickCount: 1 } },
        { new: true }
      );

      if (!message || !message.link) {
        return res.redirect("/");
      }

      const resolvedAdditionalInfo =
        courseIdParam &&
        message.targetCourses?.some(
          (course) => course.courseId === courseIdParam
        )
          ? courseIdParam
          : undefined;

      // Track click event if enabled and redis is available
      if (message.clickEventLogging && redis) {
        trackIntensiveClick(redis, req, messageId, "targeted-message", {
          additionalInfo: resolvedAdditionalInfo,
        }).catch((error) => {
          console.error("Error tracking targeted message click event:", error);
        });
      }

      return res.redirect(302, message.link);
    } catch (error) {
      console.error("Error tracking targeted message click:", error);
      return res.redirect("/");
    }
  });
};
