import express from "express"
import passport from "passport"

import { SIS_Classes } from "#src/controllers/_index"

const router = express.Router()
const authenticate = passport.authenticate("jwt", { session: false })

router.get(
  "/requestClassData",
  authenticate,
  SIS_Classes.requestClassDataHandler
)
router.get(
  "/requestClassSectionData",
  authenticate,
  SIS_Classes.requestClassSectionDataHandler
)
router.get("/requestClassDump", authenticate, SIS_Classes.requestClassDump)
// router.get("/sisCourse/:id", authenticate, SIS_Classes.getSISCourse)

export const sis_classes = router
