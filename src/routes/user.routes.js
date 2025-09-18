import { Router } from "express";
import {
  loginUser,
  logoutUser,
  registerUser,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middlerware.js";

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

router.route("/logout").post(verifyJWT, logoutUser);
export default router;
