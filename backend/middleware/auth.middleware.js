const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { env } = require("../config/env");

const requireAuth = asyncHandler(async (req, _res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    throw new ApiError(401, "Authentication token is required");
  }

  let payload;
  try {
    payload = jwt.verify(token, env.jwtSecret);
  } catch (_error) {
    throw new ApiError(401, "Invalid or expired authentication token");
  }

  const user = await User.findById(payload.sub);
  if (!user) {
    throw new ApiError(401, "Authenticated user no longer exists");
  }

  req.user = user;
  next();
});

const allowRoles = (...roles) => (req, _res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(new ApiError(403, "You do not have permission to access this resource"));
  }

  return next();
};

module.exports = {
  requireAuth,
  allowRoles,
};
