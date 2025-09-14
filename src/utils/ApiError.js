class ApiError extends Error {
  constructor(
    statusCode,
    message = "Something went wrong",
    stack = "",
    errors = []
  ) {
    super();
    this.message = message;
    this.stack = stack;
    this.errors = errors;
    this.statusCode = statusCode;
    this.success = false;

    if (stack) {
      // if stack trace is provided by the error called this class update this;
      this.stack = stack;
    } else {
      // else create a new fresh one but create it from this error class so the stack trace is clean;
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export {ApiError};