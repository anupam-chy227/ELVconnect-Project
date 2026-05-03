const ApiError = require("../utils/ApiError");

const notFoundHandler = (req, _res, next) => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

const errorHandler = (error, _req, res, _next) => {
  const statusCode = error.statusCode || 500;
  const isOperational = error.isOperational || statusCode < 500;

  if (!isOperational) {
    console.error(error);
  }

  res.status(statusCode).json({
    success: false,
    message: isOperational ? error.message : "Internal server error",
    ...(process.env.NODE_ENV !== "production" && { stack: error.stack }),
  });
};

module.exports = {
  notFoundHandler,
  errorHandler,
};
