import dotenv from "dotenv";
dotenv.config({
  path : './.env'
});

import connectDB from "./db/index.js";
import { app } from "./app.js";


connectDB()
.then(() => {
  app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
  });
 
} )
.catch((error) => {
  console.error("MongoDB connection failed:", error);

});














/*
import express from "express";
const app = express();
(async() => {
  try {
    await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`);
    app.on("error", (error) => {
      console.error("Error connecting to MongoDB:", error);
      throw error;
    });
    
    app.listen(process.env.PORT, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });

  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw error;
  }
})()
*/