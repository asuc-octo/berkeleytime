import express from "express"
import passport from "passport"

import { Courses } from "#src/controllers/_index"

const router = express.Router()
const authenticate = passport.authenticate("jwt", { session: false })

router.get("/pullXml", authenticate, Courses.pullXml)

export default router
