import { Router } from "express";
import { logoutUser, reffreshAccessToken, registerUser, changeCurrentPassword, getCuurentUser, updateAccountDetails, updateUserAvatar,updateUserCoverImage,getUserChannelProfile,getWatchHistory } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { loginUser } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();

router.post('/register', 
  //file upload middleware to handle the file upload for avatar and cover image
  upload.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'coverImage', maxCount: 1 }
  ]),
  //controller to handle the user registration
  registerUser);

router.post('/login', loginUser);

//secured route to test the authentication middleware
router.post('/logout', verifyJWT, logoutUser);
router.post('/refresh-token', reffreshAccessToken);
router.post('/change-password', verifyJWT, changeCurrentPassword);
router.get('/current-user', verifyJWT, getCuurentUser);
router.patch('/update-account', verifyJWT, updateAccountDetails);
router.patch('/avatar', verifyJWT, upload.single('avatar'), updateUserAvatar);
router.patch('/cover-image', verifyJWT, upload.single('coverImage'), updateUserCoverImage);
router.get('/c/:userName', getUserChannelProfile);
router.get('/watch-history', verifyJWT, getWatchHistory);
export { router };