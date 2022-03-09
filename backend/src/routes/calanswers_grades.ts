import express from "express";

import { CalAnswers_Grades } from "#src/controllers/_index";
import { authenticate, checkAdmin } from "#src/middlewares";

const router = express.Router();

router.get(
  "/parseGradeDump",
  authenticate,
  checkAdmin,
  CalAnswers_Grades.parseGradeDumpHandler
);

export const calanswers_grades = router;
