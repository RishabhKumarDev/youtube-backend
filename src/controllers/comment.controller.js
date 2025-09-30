import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import mongoose from "mongoose";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Video } from "../models/video.model.js";
import { Like } from "../models/like.model.js";

const getVideoComments = asyncHandler(async (req, res) => {
  //get all comments for a video
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  if (!videoId) {
    throw new ApiError(400, "Video Id is required");
  }

  const commentCursor = await Comment.aggregate([
    {
      $match: {
        video: new mongoose.Types.ObjectId(videoId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [
          {
            $project: {
              username: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        owner: {
          $first: "$owner",
        },
      },
    },
    {
      $skip: (page - 1) * limit,
    },
    {
      $limit: limit,
    },
  ]);

  res
    .status(200)
    .json(
      new ApiResponse(200, commentCursor, "Featched comments successfully")
    );
});

const addComment = asyncHandler(async (req, res) => {
  //  add a comment to a video
  const { content } = req.body;
  const { videoId } = req.params;
  const { _id } = req.user;

  if (!content || !content.trim()) {
    throw new ApiError(400, "Comment can't be empty");
  }

  if (!videoId) {
    throw new ApiError(400, "Video is missing");
  }

  const video = await Video.findById(_id);
  if (!video) {
    throw new ApiError(400, "Video doesn't exist");
  }

  if (!_id) {
    throw new ApiError(400, "User is missing");
  }

  const comment = await Comment.create({
    content: content.trim(),
    video: videoId,
    owner: _id,
  });
  await comment.populate("owner", "username avatar");

  res
    .status(200)
    .json(new ApiResponse(201, comment, "Successfully created comment"));
});

const updateComment = asyncHandler(async (req, res) => {
  // update a comment
  const { commentId } = req.params;
  const { content } = req.body;

  if (!commentId) {
    throw new ApiError(400, "Comment Id is required");
  }

  if (!content || !content.trim()) {
    throw new ApiError(400, "Comment cannot be empty");
  }

  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new ApiError(404, "Comment doesn't exist");
  }

  if (comment.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(403, "You are not allowed to update this comment");
  }

  comment.content = content.trim();
  await comment.save();
  await comment.populate("owner", "username avatar");
  res
    .status(200)
    .json(new ApiResponse(200, comment, "Comment updated successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
  //  delete a comment

  const { commentId } = req.params;
  const { _id } = req.user;

  if (!_id) {
    throw new ApiError(400, "User Id is required");
  }
  if (!commentId) {
    throw new ApiError(400, "Comment Id is required");
  }

  const deletedComment = await Comment.findOneAndDelete({
    _id: commentId,
    owner: _id,
  });

  if (!deletedComment) {
    throw new ApiError(404, "Comment not found or not authorized to delete");
  }

  await Like.deleteMany({ comment: commentId });
  res
    .status(200)
    .json(new ApiResponse(200, deletedComment, "Comment deleted successfully"));
});

export { getVideoComments, addComment, updateComment, deleteComment };
