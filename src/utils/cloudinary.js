import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { ApiError } from "./ApiError.js";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  // secure: true,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    // console.log(cloudinary.config());
    if (!localFilePath) return null;
    // console.log(process.env.CLOUDINARY_URL);
    const result = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    // console.log(result);
    fs.unlinkSync(localFilePath);
    return result;
  } catch (error) {
    // delete the file from local as the upload failed;
    fs.unlinkSync(localFilePath);
    // throw new ApiError(500, error);
    return null;
  }
};
 
export { uploadOnCloudinary };

// CLOUDINARY_URL=cloudinary://349424627971324:O7L3o6uECB-R2v7lTdIjFvIMGMQ@dix8r88u3
