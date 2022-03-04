import express from "express";
import passport from "passport";

import { Users } from "#src/controllers/users";

const router = express.Router();
const authenticate = passport.authenticate("google-verify-token");

// router.post("/register", AjvMiddleware(usersValidator.register), Users.register);
router.delete("/current", authenticate, Users.delete);
router.get("/current", authenticate, Users.current);
router.post("/google/callback", Users.googleCallback);

export const users = router;
