import express from "express";
import passport from "passport";

import { CalAnswers_Grades } from "#src/controllers/_index";

const router = express.Router();
const authenticate = passport.authenticate("jwt", { session: false });

router.get("/parseGradeDump", authenticate, CalAnswers_Grades.parseGradeDump);

export const calanswers_grades = router;
