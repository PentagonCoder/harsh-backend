import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";

//* Middleware to verify JWT token and authenticate user
export const verifyJWT =asyncHandler(async (req, res, next) => {

  try {
    //AccessToken comes from cookie or authorization header
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
    if (!token) {
      throw new ApiError( 401, "Unauthorized: No token provided User not authenticated");
    }
    //this checks the token validity and decodes the token to get the user information from the token
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    //find the user in the database using the decodedtoken(user) id from the token and exclude the password and refresh token from the result
    const user = await User.findById(decodedToken._id).select("-password -refreshToken");
    if (!user) {
      throw new ApiError( 401, "Invalid access token");
    }
    //if user is found, attach the user object to the request object and call the next middleware
    req.user = user;
    next();
  } catch (error) {
    throw new ApiError( 401,  error?.message || "Invalid access token");
  }
})