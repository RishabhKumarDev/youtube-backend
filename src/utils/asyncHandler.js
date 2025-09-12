const asyncHandler = (fn) => async (req, res, next) => {
  return Promise.resolve(fn(req, res, next)).catch((err) => next(err));
};

export default asyncHandler;

// try/catch version

// asyncHandler = (fn) => async (req, res, next) => {
//   try {
//     await fn(req, res, next);
//   } catch (err) {
//     res.status(err.code || 500).json({
//       success: false,
//       message: err.message,
//     });
//     next(err);
//   }
// };
