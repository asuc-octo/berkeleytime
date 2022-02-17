import express from "express";
import passport from "passport";

import { Users } from "#src/controllers/users";
import { AjvMiddleware, usersValidator } from "#src/validation/_index";

const router = express.Router();
const authenticate = passport.authenticate("jwt", { session: false });

router.post("/login", AjvMiddleware(usersValidator.login), Users.login);
router.post(
  "/register",
  AjvMiddleware(usersValidator.register),
  Users.register
);
router.get("/activate/:token", Users.activate);
router.get("/exists", authenticate, Users.exists);
router.get("/current", authenticate, Users.current);
router.delete("/current", authenticate, Users.delete);

export const users = router;
