import 'dotenv/config.js';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log("Cloudinary config:", {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET ? "loaded" : "MISSING"
});

const uploadToCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    const responce =await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    })
    //fill uploded file url in responce and return it to the client
    // console.log("file uploaded successfully", responce.url);
    fs.unlinkSync(localFilePath);
    return responce;
    
  } catch (error) {
    fs.unlinkSync(localFilePath);
    console.error("Error uploading file to Cloudinary:", error);
    return null;
  }
}

const deleteFromCloudinary = async (publicId, resourceType) => {
  try {
    if(!publicId) return null;
    const responce = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    })
    return responce;
  } catch (error) {
    console.error("Error deleting file from Cloudinary:", error);
    return null;
  }
}
 
export { uploadToCloudinary, deleteFromCloudinary }