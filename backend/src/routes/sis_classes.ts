import express from "express";

import { SIS_Classes } from "#src/controllers/_index";
import { authenticate, checkAdmin } from "#src/middlewares";

const router = express.Router();

router.get(
  "/requestClassData",
  authenticate,
  SIS_Classes.requestClassDataHandler
);
router.get(
  "/requestClassDump",
  authenticate,
  checkAdmin,
  SIS_Classes.requestClassDumpHandler
);

export const sis_classes = router;
