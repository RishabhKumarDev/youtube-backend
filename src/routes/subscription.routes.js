import { Router } from "express";
import { verifyAccessToken } from "../middlewares/auth.middlerware";
import {
  toggleSubscription,
  getSubscribedChannels,
  getUserChannelSubscribers,
} from "../controllers/subscription.controller";

const router = Router();

router.use(verifyAccessToken);

router.route("/c/:channelId").get(getSubscribedChannels).post(toggleSubscription)

router.route("/u/:subscriberId").get(getUserChannelSubscribers);

export default router;
