import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const registerUser = asyncHandler(async (req, res) => {

  //get the user details from the request body, get user details from frontend
  const { fullName, email, userName ,password } = req.body;
  // console.log("req.body", req.body);
  

  //validate the user details, validation - not empty
  if([fullName, email, userName, password].some((field)=> field?.trim()==="")){
    throw new ApiError( 400, "All fields are required");
  }
  
  // check if user already exists: username, email
  const existingUser = await User.findOne({ $or: [{ email }, { userName }] });
  if(existingUser){
    throw new ApiError( 400, "User already exists with the provided email or username");
  }

  
  // console.log(req.files);
  // upload avatar and cover image to cloudinary
  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
  // // console.log("Avatar path:", avatarLocalPath);
  if (!avatarLocalPath) {
    throw new ApiError( 400, "Avatar file is required");
  }

  const avatar = await uploadToCloudinary(avatarLocalPath);
  const coverImage = await uploadToCloudinary(coverImageLocalPath)
  
  if (!avatar) {
    throw new ApiError( 400, "Failed to upload avatar");
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

  // remove password and refresh token from response
  const createdUser = await User.findById(user._id).select("-password -refreshToken");
  if (!createdUser) {
    throw new ApiError( 500, "somthing went wrong while registering the user");
  }


  // return response
  return res.status(201).json(
    new ApiResponse( 201, createdUser, "User registered successfully")
  );
})
export { registerUser }