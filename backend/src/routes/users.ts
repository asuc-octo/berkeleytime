import express from "express";

import { Users } from "#src/controllers/users";
import { authenticate } from "#src/middlewares";

const router = express.Router();

router.delete("/current", authenticate, Users.delete);
router.get("/current", authenticate, Users.current);

router.post("/google/callback", Users.googleCallback);

export const users = router;
