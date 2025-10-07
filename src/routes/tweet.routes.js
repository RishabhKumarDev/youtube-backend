import { Router } from "express";
import { verifyAccessToken } from "../middlewares/auth.middlerware";
import {
  addTweet,
  getUserTweet,
  updateTweet,
  deleteTweet,
} from "../controllers/tweet.controller";
const router = Router();

router.use(verifyAccessToken);

router.route("/").get(getUserTweet).post(addTweet);
router.route("/:tweetId").patch(updateTweet).delete(deleteTweet);

export default router;
