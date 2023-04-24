import { Router } from "express";
import passport from "passport";
import * as userController from "../controllers/userControllers.js";

const router = Router();
//api/user
router.post("/register", userController.register);

router.post("/login", userController.login);

router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  userController.allUsers
);

export default router;
