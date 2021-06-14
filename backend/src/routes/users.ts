import express from "express"
import passport from "passport"

import Users from "#src/controllers/users"

const router = express.Router()
const authenticate = passport.authenticate("jwt", { session: false })

router.post("/login", Users.login)
router.post("/register", Users.register)
router.get("/exists", authenticate, Users.exists)
router.get("/current", authenticate, Users.current)

export const users = router
