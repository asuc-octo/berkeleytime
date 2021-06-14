import express from "express"
import passport from "passport"

import Users from "#src/controllers/users"

const router = express.Router()

router.post("/register", Users.register)
router.get("/exists", Users.exists)
router.get("/current", Users.current)

export const users = router
