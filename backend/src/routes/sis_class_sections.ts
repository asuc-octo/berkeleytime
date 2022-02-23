import express from "express";
import passport from "passport";

import { SIS_Class_Sections } from "#src/controllers/_index";

const router = express.Router();
const authenticate = passport.authenticate("jwt", { session: false });

router.get(
  "/requestClassSectionData",
  authenticate,
  SIS_Class_Sections.requestClassSectionDataHandler
);
router.get(
  "/requestClassSectionDump",
  authenticate,
  SIS_Class_Sections.requestClassSectionDumpHandler
);

export const sis_class_sections = router;
