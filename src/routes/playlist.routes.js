import { Router } from "express";
import {
  createPlaylist,
  getPlaylistById,
  getUsersPlaylists,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  updatePlaylist,
  deletePlaylist,
} from "../controllers/playlist.controller";
import { verifyAccessToken } from "../middlewares/auth.middlerware";
const router = Router();

router.use(verifyAccessToken);

router.route("/").post(createPlaylist);

router
  .route("/:playlistId")
  .get(getPlaylistById)
  .patch(updatePlaylist)
  .delete(deletePlaylist);

router.route("/add/:videoId/:playlistId").patch(addVideoToPlaylist);
router.route("/remove/:videoId/:playlistId").patch(removeVideoFromPlaylist);

router.route("/user/:userId").get(getUsersPlaylists);

export default router;
