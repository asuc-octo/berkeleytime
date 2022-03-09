import passport from "passport";

import { PRIVILEGED_MODE } from "#src/config";

export const authenticate = PRIVILEGED_MODE
  ? (req, res, next) => next()
  : passport.authenticate("google-verify-token");

export const checkAdmin = (req, res, next) => {
  if (PRIVILEGED_MODE) {
    return next();
  }
  if (!req.user.admin) {
    return res.send(403);
  }
  next();
};
