import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
  // get user data
  let { username, email, fullName, password } = req.body;
  console.log(username, email);

  //validate user data
  if (
    [username, email, fullName, password].some((filed) => filed?.trim() === "")
  ) {
    throw new ApiError(400, "All Fileds are Compulsory");
  }
  // check if user exist
  const userExist = await User.findOne({ $or: [{ username }, { email }] });
  if (userExist) {
    throw new ApiError(409, "User Already Exist");
  }

  //file handling
  // file is sent to the multer as a middleware and now req.files has path of the uploaded files;
  // file is uploaded locally;
  // get the path of the file
  const avatarLocalPath = req.files?.avatar[0]?.path;
  // const coverImageLocalPath = req.files?.coverImage[0]?.path;

  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage > 0
  ) {
    coverImageLocalPath = req.files.avatar[0].path;
  }
  // conforming if file path even exist
  if (!avatarLocalPath) throw new ApiError(400, "Avatar Image is Required!");

  // now upload those files in cloudnary;
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  console.log(avatar);

  // again check if we have avatar as it's a required field and DB will crash if it's missing
  if (!avatar) throw new ApiError(400, "Avatar Image is Required");

  // at this point we are sure we have everthing we need to upload to DB so, create an obj
  const data = {
    fullName,
    username: username.toLowerCase(),
    email,
    password, // remember password is hashed by .pre;
    avatar: avatar.url,
    coverImage: coverImage?.url || "", // we have not validated this so taking care of edge case;
  };
  // now create user;
  const user = await User.create(data);

  // we also need to check if user is created or not(there are many ways);
  // we find him;
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  ); // this excludes the passed fields with -;

  if (!createdUser) return new ApiError(500, "couldn't Create User");

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User Created Successfully!"));
});

export { registerUser };
