import { Router } from "express";
import { logoutUser, reffreshAccessToken, registerUser } from "../controllers/user.controller.js";
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
export { router };