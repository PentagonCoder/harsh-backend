import { Router } from 'express';
import {
  deleteVideo,
  getAllVideos,
  getVideoById,
  publishAVideo,
  togglePublishStatus,
  updateVideo,
} from "../controllers/video.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"
import {upload} from "../middlewares/multer.middleware.js"

const router = Router();
//this is used to protect all the routes in this file, so that only authenticated users can access these routes. It will check for the JWT token in the request header and verify it before allowing access to the routes.
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file


router.get("/", getAllVideos);
router.post("/", upload.fields([
  { name: "videoFile", maxCount: 1 },
  { name: "thumbnail", maxCount: 1 },
]), publishAVideo);

// router.route("/:videoId").get(getVideoById).delete(deleteVideo).patch(upload.single("thumbnail"), updateVideo);
router.get("/:videoId", getVideoById);
router.delete("/:videoId", deleteVideo);
router.patch("/:videoId", upload.single("thumbnail"), updateVideo);
router.route("/toggle/publish/:videoId").patch(togglePublishStatus);

export default router;



// router
//   .route("/")
//   .get(getAllVideos)
//   .post(
//     upload.fields([
//       {
//         name: "videoFile",
//         maxCount: 1,
//       },
//       {
//         name: "thumbnail",
//         maxCount: 1,
//       },
      
//     ]),
//     publishAVideo
//   );