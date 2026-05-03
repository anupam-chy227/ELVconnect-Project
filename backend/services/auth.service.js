const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const ApiError = require("../utils/ApiError");
const { env } = require("../config/env");

const signToken = (user) =>
  jwt.sign(
    {
      sub: user.id,
      role: user.role,
      email: user.email,
    },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );

const register = async ({ fullName, email, password, role }) => {
  if (!fullName || !email || !password) {
    throw new ApiError(400, "Full name, email, and password are required");
  }

  const existingUser = await User.findByEmail(email.toLowerCase());
  if (existingUser) {
    throw new ApiError(409, "Email is already registered");
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({
    fullName,
    email: email.toLowerCase(),
    passwordHash,
    role,
  });

  return {
    user,
    token: signToken(user),
  };
};

const login = async ({ email, password }) => {
  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const user = await User.findByEmail(email.toLowerCase());
  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password_hash);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid email or password");
  }

  const { password_hash: _passwordHash, ...safeUser } = user;

  return {
    user: safeUser,
    token: signToken(safeUser),
  };
};

module.exports = {
  register,
  login,
};
