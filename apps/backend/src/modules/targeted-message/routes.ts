import type { Application, Request, Response } from "express";
import type { RedisClientType } from "redis";

import { TargetedMessageModel } from "@repo/common/models";

import { trackIntensiveClick } from "../click-tracking/controller";
import { bufferTrackingEvents } from "../tracking/controller";

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

      if (redis) {
        // Legacy intensive click tracking (opt-in per message)
        if (message.clickEventLogging) {
          trackIntensiveClick(redis, req, messageId, "targeted-message", {
            additionalInfo: resolvedAdditionalInfo,
          }).catch((error) => {
            console.error(
              "Error tracking targeted message click event:",
              error
            );
          });
        }

        // Unified tracking — always emitted
        bufferTrackingEvents(redis, req, [
          {
            eventType: "click",
            targetType: "targeted-message",
            targetId: messageId,
            metadata: matchedCourse
              ? {
                  courseId: courseIdParam,
                  subject: matchedCourse.subject,
                  courseNumber: matchedCourse.courseNumber,
                  semester: semesterParam,
                  year: yearParam ? Number(yearParam) : undefined,
                }
              : undefined,
            timestamp: new Date().toISOString(),
          },
        ]).catch((error) => {
          console.error(
            "Error buffering targeted-message tracking event:",
            error
          );
        });
      }

      return res.redirect(302, message.link);
    } catch (error) {
      console.error("Error tracking targeted message click:", error);
      return res.redirect("/");
    }
  });
};
