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
    const semesterParam =
      typeof req.query.semester === "string" ? req.query.semester : undefined;
    const yearParam =
      typeof req.query.year === "string" ? req.query.year : undefined;

    try {
      const message = await TargetedMessageModel.findByIdAndUpdate(
        messageId,
        { $inc: { clickCount: 1 } },
        { new: true }
      );

      if (!message || !message.link) {
        return res.redirect("/");
      }

      const matchedCourse = courseIdParam
        ? message.targetCourses?.find(
            (course) => course.courseId === courseIdParam
          )
        : undefined;

      const resolvedAdditionalInfo = matchedCourse
        ? JSON.stringify({
            courseId: courseIdParam,
            subject: matchedCourse.subject,
            courseNumber: matchedCourse.courseNumber,
            semester: semesterParam,
            year: yearParam ? Number(yearParam) : undefined,
          })
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
