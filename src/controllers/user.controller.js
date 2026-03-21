import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessTokenandRefreshToken = async (userId) => {
  try {
    const user=await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };

  } catch (error) {
    throw new ApiError( 500, "somthing went wrong while generating access token and refresh token");
  }
}

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

const loginUser = asyncHandler(async (req, res) => {
  //receive username and password from request body
  const { email,userName, password } = req.body;

  //check if username or email is provided
  if (!email && !userName) {
    throw new ApiError( 400, "Either email or username is required");
  }

  //username or email can be used to login
  const user = await User.findOne({
    // $or are mongodb operator to find the user with either email or username
    $or: [{ email }, { userName }]
  });
  //if user not found, return error
  if (!user) {
    throw new ApiError( 404, "User not found");
  }

  //if user found, compare the password with the hashed password in the database
  const isPasswordValid = await user.isPassawordcorrect(password);
  //if password does not match, return error
  if (!isPasswordValid) {
    throw new ApiError( 401, "Invalid credentials");
  }

  //if password matches, generate access token and refresh token
  const { accessToken, refreshToken } = await generateAccessTokenandRefreshToken(user._id);
  
  //save the refresh token in the database
  const loggedInUser = await User.findById(user._id).select("-password -refreshToken");
  const options = { new: true, runValidators: false };

  //return the access token and refresh token in the response
  return res
  .status(200)
  .cookie("refreshToken", refreshToken,options)
  .cookie("accessToken", accessToken,options)
  .json(
    new ApiResponse( 
      200, 
      { 
        user: loggedInUser, accessToken, refreshToken 
      }, 
        "User logged in successfully"
      )
  );
  
})

const logoutUser = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  //find the user in the database and remove the refresh token
  await User.findByIdAndUpdate(userId, 
    { 
      $unset: { 
        refreshToken: "" 
      } 
    }, 
    { 
      new: true, 
      runValidators: false 
    }
  );

  const options = {
      httpOnly: true,
      secure: true
  }
  
  //clear the cookies
  //return response
  return res.status(200)
  .clearCookie("refreshToken", options)
  .clearCookie("accessToken", options)
  .json(
    new ApiResponse( 200, null, "User logged out successfully")
  );

})

const reffreshAccessToken = asyncHandler(async (req, res) => {
  //get the refresh token from cookie or request body
  const incomingRefreshToken = req.cookies?.refreshToken || req.headers.body.refreshToken

  //if refresh token is not provided, return error
  if (!incomingRefreshToken) {
    throw new ApiError( 401, "Unauthorized: No refresh token provided");
  }
  try {
    //verify the refresh token and get the user id from the token
    const decodedtoken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
  
    //find the user in the database using the decodedtoken(user) id from the token
    const user = await User.findById(decodedtoken._id);
    
    //if user not found, return error
    if (!user) {
      throw new ApiError( 401, "Unauthorized: Invalid refresh token");
    }
  
    if (user?.refreshToken !== incomingRefreshToken) {
      throw new ApiError( 401, "Refresh token is expired or used,please login again");
    }
  
    //if user found, generate new access token and refresh token
    const { accessToken, newRefreshToken } = await generateAccessTokenandRefreshToken(user._id);
  
    const options = { 
      new: true, 
      runValidators: false 
    };
    
    //return the new access token and refresh token in the response
    return res
    .status(200)
    .cookie("refreshToken", newRefreshToken,options)
    .cookie("accessToken", accessToken,options)
    .json(
      new ApiResponse( 
        200, 
        { 
          user: user, accessToken, refreshToken: newRefreshToken 
        }, 
          "Access token refreshed successfully"
        )
    );
} catch (error) {
  throw new ApiError(401, error?.message || "Invalid refresh token")
}
})


export { registerUser, loginUser, logoutUser, reffreshAccessToken };