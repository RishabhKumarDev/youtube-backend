import { Router } from "express";
import {
  getVideoComments,
  addComment,
  deleteComment,
  updateComment,
} from "../controllers/comment.controller.js";
import { verifyAccessToken } from "../middlewares/auth.middlerware.js";

const router = Router({mergeParams:true});

router.use(verifyAccessToken);

router.route("/:videoId").get(getVideoComments).post(addComment);
router.route("/:commentId").patch(updateComment).delete(deleteComment);

export default router;
