import express from "express";
import passport from "passport";

import { SIS_Classes } from "#src/controllers/_index";

const router = express.Router();
const authenticate = passport.authenticate("jwt", { session: false });

router.get(
  "/requestClassData",
  authenticate,
  SIS_Classes.requestClassDataHandler
);
router.get(
  "/requestClassSectionData",
  authenticate,
  SIS_Classes.requestClassSectionDataHandler
);
router.get(
  "/requestClassSectionDump",
  authenticate,
  SIS_Classes.requestClassSectionDump
);
router.get("/requestClassDump", authenticate, SIS_Classes.requestClassDump);

export const sis_classes = router;
