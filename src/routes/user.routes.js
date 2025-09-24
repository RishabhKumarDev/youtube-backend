import { Router } from "express";
import {
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getChannelProfile,
  getUserWatchHistory,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyAccessToken } from "../middlewares/auth.middlerware.js";

const router = Router();
const fields = [
  {
    name: "avatar",
    maxCount: 1,
  },
  {
    name: "coverImage",
    maxCount: 1,
  },
];

router.route("/register").post(upload.fields(fields), registerUser);
router.route("/login").post(loginUser);

// secure routes
router.route("/logout").post(verifyAccessToken, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);

router.route("/change-password").post(verifyAccessToken, changeCurrentPassword);

router.route("/current-user").get(verifyAccessToken, getCurrentUser);

router.route("/update-account").patch(verifyAccessToken, updateAccountDetails);

router
  .route("/update-avatar")
  .patch(verifyAccessToken, upload.single("avatar"), updateUserAvatar);
  
router
  .route("/update-cover-image")
  .patch(verifyAccessToken, upload.single("coverImage"), updateUserCoverImage);
  
router.route("/c/:username").get(verifyAccessToken, getChannelProfile);

router.route("/watch-history").get(verifyAccessToken, getUserWatchHistory);
export default router;
