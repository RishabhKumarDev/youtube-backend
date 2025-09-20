import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

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
  console.log(req.files);
  const avatarLocalPath =
    req.files?.avatar && req.files.avatar.length > 0
      ? req.files.avatar[0].path
      : null;
  // const coverImageLocalPath = req.files?.coverImage[0]?.path;

  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
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

const generateAccessTokenAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, error?.message);
  }
};
const loginUser = asyncHandler(async (req, res) => {
  // flow.
  // 1. get user input(username, password);
  // 2. validate inputs( valid input or not);
  // 3. does user exist in the DB?
  //  check if procided password is correct
  // 3. generate refresh token/ access token;
  // 4. put the token in the headers(auth: <bearer>); cookie(sccure);

  const { username, email, password } = req.body;

  if ((!username && !email) || !password) {
    throw new ApiError(400, "Username OR Email is required!!!");
  }

  let user = await User.findOne({ $or: [{ email }, { username }] });

  if (!user) {
    throw new ApiError(404, "User Don't Exist in the DB");
  }

  let isPasswordVaild = await user.isPasswordCorrect(password);
  if (!isPasswordVaild) {
    throw new ApiError(
      401,
      "Wrong Password, Please Enter a correct password!!!"
    );
  }

  const { accessToken, refreshToken } =
    await generateAccessTokenAndRefreshToken(user._id);

  const logedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: logedInUser,
          refreshToken,
          accessToken,
        },
        "User Logged In Successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    { $set: { refreshToken: undefined } },
    { new: true }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User Loged Out Successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken;
  if (!incomingRefreshToken) {
    throw new ApiError(401, "Invalid Refresh Token");
  }

  const decodedRefreshToken = jwt.verify(
    incomingRefreshToken,
    process.env.REFRESH_TOKEN_SECRET
  );

  if (!decodedRefreshToken) {
    throw new ApiError(401, "Invalid Refresh Token");
  }

  let user = await User.findById(decodedRefreshToken?._id);

  if (!user) {
    throw new ApiError(401, "Refresh Token Expired or Used");
  }
  if (incomingRefreshToken !== user?.refreshToken) {
    throw new ApiError(401, "Refresh Token is Expired or used");
  }

  const { accessToken, refreshToken: newRefreshToken } =
    await generateAccessTokenAndRefreshToken(user._id);

  const options = {
    httpOnly: true,
    secure: true,
  };
  res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", newRefreshToken, options)
    .json(
      new ApiResponse(
        200,
        { accessToken, refreshToken: newRefreshToken },
        "Generated Access Token Successfully"
      )
    );
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  let { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword)
    throw new ApiError(400, "Password Feild Can't Be Empty!");
  if (oldPassword === newPassword)
    throw new ApiError(400, "New Password can't be same as old");

  let user = await User.findById(req.user._id);

  let isPasswordCorrect = user.isPasswordCorrect(oldPassword);
  if (!isPasswordCorrect) throw new ApiError(400, "Wrong Password Entered");

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });
  res.status(200).json(new ApiResponse(200, {}, "password changed Successful"));
});
const getCurrentUser = asyncHandler(async (req, res) => {
  res
    .status(200)
    .json(new ApiResponse(200, req.user, "current user sent successfully"));
});
const updateAccountDetails = asyncHandler(async (req, res) => {
  let { fullName, email } = req.body;
  if (!fullName || !email) throw new ApiError(400, "Both Feilds are requird");

  const user = await User.findByIdAndUpdate(
    req.body._id,
    {
      $set: {
        fullName,
        email,
      },
    },
    { new: true }
  ).select("-password -refreshToken");

  res
    .status(200)
    .json(new ApiResponse(200, user, "Details Updated Successfully"));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
};
