import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
const router = Router();

router.post('/register', 
  //file upload middleware to handle the file upload for avatar and cover image
  upload.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'coverImage', maxCount: 1 }
  ]),
  //controller to handle the user registration
  registerUser);

export { router };