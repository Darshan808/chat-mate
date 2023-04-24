import { Router } from "express";
import passport from "passport";
import * as messageController from "../controllers/messageControllers.js";

const router = Router();
//api/message
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  messageController.sendMessage
);
router.get(
  "/:chatId",
  passport.authenticate("jwt", { session: false }),
  messageController.allMessages
);

export default router;
