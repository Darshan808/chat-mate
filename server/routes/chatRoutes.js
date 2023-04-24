import { Router } from "express";
import passport from "passport";
import * as chatController from "../controllers/chatControllers.js";

const router = Router();
//api/chat
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  chatController.accessChat
);
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  chatController.fetchChat
);
router.post(
  "/group",
  passport.authenticate("jwt", { session: false }),
  chatController.createGroupChat
);
router.patch(
  "/rename",
  passport.authenticate("jwt", { session: false }),
  chatController.renameGroup
);
router.put(
  "/groupadd",
  passport.authenticate("jwt", { session: false }),
  chatController.addToGroup
);
router.put(
  "/groupremove",
  passport.authenticate("jwt", { session: false }),
  chatController.removeFromGroup
);

export default router;
