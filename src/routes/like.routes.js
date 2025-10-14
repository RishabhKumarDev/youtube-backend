import { Router } from "express";
import { verifyAccessToken } from "../middlewares/auth.middlerware";
import {
  getLikedVideos,
  toggleCommentLike,
  toggleTweetLike,
  toggleVideoLike,
} from "../controllers/likes.controller";

const router = Router();

router.use(verifyAccessToken);

router.route("/").get(getLikedVideos);
router.route("/c/:commentId").post(toggleCommentLike);
router.route("/v/:videoId").post(toggleVideoLike);
router.route("/t/:tweetId").post(toggleTweetLike);

export default router;
