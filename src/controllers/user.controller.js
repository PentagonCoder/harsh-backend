import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const registerUser = asyncHandler(async (req, res) => {
  // check for images, check for avatar
  // upload them to cloudinary, avatar
  // create user object - create entry in db
  // remove password and refresh token field from response
  // check for user creation

  
  // get user details from frontend
  //get the user details from the request body
  const { fullName, email, userName ,password } = req.body;
  
  // validation - not empty
  //validate the user details
  if([fullName, email, userName, password].some((field)=> field?.trim()==="")){
    throw new ApiError("All fields are required", 400);
  }
  
  // check if user already exists: username, email
  const existingUser = await User.findOne({ $or: [{ email }, { userName }] });
  if(existingUser){
    throw new ApiError("User already exists with the provided email or username", 400);
  }

  // upload avatar and cover image to cloudinary
  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError("Avatar file is required", 400);
  }

  const avatar = await uploadToCloudinary(avatarLocalPath);
  const coverImage = coverImageLocalPath ? await uploadToCloudinary(coverImageLocalPath) : null;
  
  if (!avatar) {
    throw new ApiError("upload avatar", 400);
  }

  // create user object and save to database
  const user = await User.create({
    fullName,
    email,
    userName : userName.toLowerCase(),
    password,
    avatar: avatar.url,
    coverImage: coverImage?.url || ""
  });

  const createdUser = await User.findById(user._id).select("-password -refreshToken");
  if (!createdUser) {
    throw new ApiError("somthing went wrong while registering the user", 500);
  }
  // remove password and refresh token from response
  const { password: _, refreshToken, ...userData } = user.toObject();

  // return response
  return res.status(201).json(
    new ApiResponse("User registered successfully", 201, userData)
  );
})
export { registerUser }