import express from "express";
import passport from "passport";

import { SIS_Courses } from "#src/controllers/_index";

const router = express.Router();
const authenticate = passport.authenticate("jwt", { session: false });

router.get("/requestData", authenticate, SIS_Courses.requestDataHandler);
router.get("/requestDump", authenticate, SIS_Courses.requestDumpHandler);
router.get("/parseDump", authenticate, SIS_Courses.parseDumpHandler);

export const sis_courses = router;
