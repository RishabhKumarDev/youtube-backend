import asyncHandler from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";

const healthCheck = () => {
  asyncHandler(async (req, res) => {});
};

export { healthCheck };
