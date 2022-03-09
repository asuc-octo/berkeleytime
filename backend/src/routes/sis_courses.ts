import express from "express";

import { SIS_Courses } from "#src/controllers/_index";
import { authenticate, checkAdmin } from "#src/middlewares";

const router = express.Router();

router.get("/requestData", authenticate, SIS_Courses.requestDataHandler);
router.get(
  "/requestDump",
  authenticate,
  checkAdmin,
  SIS_Courses.requestDumpHandler
);
router.get(
  "/parseDump",
  authenticate,
  checkAdmin,
  SIS_Courses.parseDumpHandler
);

export const sis_courses = router;
