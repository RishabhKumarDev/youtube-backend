import { Router } from "express";
import {
  getAllVideos,
  publishVideo,
  getVideoById,
  deleteVideo,
  updateVideo,
  togglePublishStatus,
} from "../controllers/video.controller";
import { verifyAccessToken } from "../middlewares/auth.middlerware";
import { upload } from "../middlewares/multer.middleware";

const router = Router();
const fields = [
  { name: "videoFile", maxCount: 1 },
  { name: "thumbnail", maxCount: 1 },
];
router.use(verifyAccessToken);

router.route("/").get(getAllVideos).post(upload.fields(fields), publishVideo);

router
  .route("/:videoId")
  .get(getVideoById)
  .patch(upload.single("thumbnail"), updateVideo)
  .delete(deleteVideo);

router.route("/toggle-publish/:videoId").patch(togglePublishStatus);

export default router;
