import { Schema } from "mongoose";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { use } from "react";

const userSchema = new Schema(
  {
    userName : {
      type : String,
      required : true,
      unique : true,
      lowercase : true,
      trim : true,
      index: true
    },
    email : {
      type : String,
      required : true,
      unique : true,
      lowercase : true,
      trim : true,
    },
    fullName : {
      type : String,
      required : true,
      trim : true,
      index: true
    },
    avatar : {
      type : String,
      required : true,
    },
    coverImage : {
      type : String,

    },
    watchlist : [
      {
        type : Schema.Types.ObjectId,
        ref : "Movie"
      }
    ],
    password : {
      type : String,
      required :  [true, 'Password is required'],
    },
    refreshToken : {
      type : String,
    }
    
  }, {
  timestamps : true
})

// this middleware will run before saving user to the database it will hash the password before saving it to the database
userSchema.pre("save", async function(next){
  if(!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
})

// this method compare password entered by user with hashed password stored in database
userSchema.methods.isPassawordcorrect = async function(Password){
  return await bcrypt.compare(Password, this.password);
}

userSchema.methods.generateAccessToken = function(){
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      userName: this.userName,
      fullName: this.fullName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCEES_TOKEN_EXPIRES,
    }
  )
}

userSchema.methods.generateRefreshToken = function(){
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRES,
    }
  )
}

export const User = mongoose.model("User", userSchema);
