import express from "express";

import { SIS_Class_Sections } from "#src/controllers/_index";
import { authenticate, checkAdmin } from "#src/middlewares";

const router = express.Router();
router.get(
  "/requestClassSectionData",
  authenticate,
  SIS_Class_Sections.requestClassSectionDataHandler
);
router.get(
  "/requestClassSectionDump",
  authenticate,
  checkAdmin,
  SIS_Class_Sections.requestClassSectionDumpHandler
);

export const sis_class_sections = router;
