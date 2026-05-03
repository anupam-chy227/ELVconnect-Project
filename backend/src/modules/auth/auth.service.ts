import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import { User } from '../users/user.model';
import { signAccessToken, signRefreshToken } from '../../utils/jwt';
import { env } from '../../config/env';
import { RegisterCustomerInput, RegisterServiceProviderInput, LoginInput, GoogleAuthInput } from './auth.schema';

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutes
const RESET_TOKEN_EXPIRY_MS = 60 * 60 * 1000; // 1 hour
const googleClient = new OAuth2Client();

// ── Register Customer ─────────────────────────────────────────────────────
export const registerCustomer = async (data: RegisterCustomerInput) => {
  const existing = await User.findOne({ email: data.email });
  if (existing) {
    const err = new Error('Email already registered') as any;
    err.statusCode = 409;
    err.code = 'CONFLICT';
    throw err;
  }

  const user = await User.create({
    email: data.email,
    password: data.password,
    role: 'customer',
    profile: {
      fullName: data.fullName,
      companyName: data.companyName,
      phone: data.phone,
    },
    customer: {
      industry: data.industry,
    },
  });

  return createAuthSession(user);
};

// ── Register Service Provider ─────────────────────────────────────────────
export const registerServiceProvider = async (data: RegisterServiceProviderInput) => {
  const existing = await User.findOne({ email: data.email });
  if (existing) {
    const err = new Error('Email already registered') as any;
    err.statusCode = 409;
    err.code = 'CONFLICT';
    throw err;
  }

  const user = await User.create({
    email: data.email,
    password: data.password,
    role: 'service_provider',
    profile: {
      fullName: data.fullName,
      companyName: data.companyName,
      phone: data.phone,
    },
    businessDetails: {
      licenseNumber: data.licenseNumber,
    },
    serviceProvider: {
      specializations: data.specializations,
      yearsOfExperience: data.yearsOfExperience,
      serviceArea: { city: data.city, country: data.country },
      serviceRadius: data.serviceRadius,
    },
  });

  return createAuthSession(user);
};

// ── Login ─────────────────────────────────────────────────────────────────
export const login = async (
  data: LoginInput,
  deviceInfo?: string
): Promise<{ user: any; accessToken: string; refreshToken: string }> => {
  // Select password explicitly (it's select: false)
  const user = await User.findOne({ email: data.email }).select('+password');

  if (!user) {
    const err = new Error('Invalid email or password') as any;
    err.statusCode = 401;
    err.code = 'UNAUTHORIZED';
    throw err;
  }

  if (user.isLocked()) {
    const err = new Error('Account temporarily locked due to too many failed attempts') as any;
    err.statusCode = 401;
    err.code = 'UNAUTHORIZED';
    throw err;
  }

  const isMatch = await user.comparePassword(data.password);

  if (!isMatch) {
    user.loginAttempts += 1;
    if (user.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
      user.lockUntil = new Date(Date.now() + LOCK_DURATION_MS);
    }
    await user.save();

    const err = new Error('Invalid email or password') as any;
    err.statusCode = 401;
    err.code = 'UNAUTHORIZED';
    throw err;
  }

  // Reset lockout on success
  user.loginAttempts = 0;
  user.lockUntil = undefined;

  const session = await createAuthSession(user, deviceInfo);

  return session;
};

export const googleAuth = async (
  data: GoogleAuthInput,
  deviceInfo?: string
): Promise<{ user: any; accessToken: string; refreshToken: string }> => {
  if (!env.GOOGLE_CLIENT_ID) {
    const err = new Error('Google authentication is not configured') as any;
    err.statusCode = 500;
    err.code = 'GOOGLE_AUTH_NOT_CONFIGURED';
    throw err;
  }

  let ticket;
  try {
    ticket = await googleClient.verifyIdToken({
      idToken: data.credential,
      audience: env.GOOGLE_CLIENT_ID,
    });
  } catch {
    const err = new Error('Invalid Google sign-in token') as any;
    err.statusCode = 401;
    err.code = 'UNAUTHORIZED';
    throw err;
  }

  const payload = ticket.getPayload();
  const email = payload?.email?.toLowerCase();

  if (!email || !payload?.email_verified) {
    const err = new Error('Google account email is not verified') as any;
    err.statusCode = 401;
    err.code = 'UNAUTHORIZED';
    throw err;
  }

  let user = await User.findOne({ email }).select('+password');

  if (!user) {
    const fullName = payload.name || email.split('@')[0];
    const avatar = payload.picture;
    const randomPassword = crypto.randomBytes(32).toString('hex');

    user = await User.create({
      email,
      password: randomPassword,
      role: data.role,
      profile: {
        fullName,
        phone: 'Google account',
        avatar,
      },
      ...(data.role === 'service_provider'
        ? {
            serviceProvider: {
              specializations: [],
              yearsOfExperience: 0,
              serviceArea: { city: '', country: 'India' },
              serviceRadius: 25,
            },
          }
        : {
            customer: {
              industry: 'other',
            },
          }),
    });
  } else {
    if (user.isLocked()) {
      const err = new Error('Account temporarily locked due to too many failed attempts') as any;
      err.statusCode = 401;
      err.code = 'UNAUTHORIZED';
      throw err;
    }

    user.loginAttempts = 0;
    user.lockUntil = undefined;

    if (payload.picture && !user.profile.avatar) {
      user.profile.avatar = payload.picture;
    }
    if (payload.name && !user.profile.fullName) {
      user.profile.fullName = payload.name;
    }
  }

  return createAuthSession(user, deviceInfo);
};

// ── Refresh Token ─────────────────────────────────────────────────────────
export const refreshAccessToken = async (
  incomingRefreshToken: string
): Promise<{ accessToken: string; refreshToken: string }> => {
  const { verifyRefreshToken } = await import('../../utils/jwt');
  const decoded = verifyRefreshToken(incomingRefreshToken);

  const user = await User.findById(decoded._id).select('+refreshTokens');
  if (!user) {
    const err = new Error('Refresh token invalid') as any;
    err.statusCode = 401;
    err.code = 'REFRESH_TOKEN_INVALID';
    throw err;
  }

  // Find matching hashed token
  let matchedIndex = -1;
  for (let i = 0; i < user.refreshTokens.length; i++) {
    const isMatch = await bcrypt.compare(incomingRefreshToken, user.refreshTokens[i].tokenHash);
    if (isMatch) {
      matchedIndex = i;
      break;
    }
  }

  if (matchedIndex === -1) {
    // Reuse detected — invalidate ALL tokens (breach signal)
    user.refreshTokens = [];
    await user.save();
    const err = new Error('Refresh token reuse detected — all sessions revoked') as any;
    err.statusCode = 401;
    err.code = 'REFRESH_TOKEN_INVALID';
    throw err;
  }

  // Remove used token (rotation)
  user.refreshTokens.splice(matchedIndex, 1);

  const tokenPayload = {
    _id: user._id.toString(),
    email: user.email,
    role: user.role,
  };
  const newAccessToken = signAccessToken(tokenPayload);
  const newRefreshToken = signRefreshToken(tokenPayload);

  const tokenHash = await bcrypt.hash(newRefreshToken, 10);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  user.refreshTokens.push({ tokenHash, createdAt: new Date(), expiresAt });

  await user.save();

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
};

// ── Logout ────────────────────────────────────────────────────────────────
export const logout = async (userId: string, refreshToken: string) => {
  const user = await User.findById(userId);
  if (!user) return;

  const results = await Promise.all(
    user.refreshTokens.map((t) => bcrypt.compare(refreshToken, t.tokenHash))
  );
  user.refreshTokens = user.refreshTokens.filter((_, i) => !results[i]);
  await user.save();
};

// ── Forgot Password ───────────────────────────────────────────────────────
export const forgotPassword = async (email: string): Promise<string> => {
  const user = await User.findOne({ email });
  // Always return success — prevent email enumeration
  if (!user) return 'If that email exists, a reset link was sent';

  const resetToken = crypto.randomBytes(32).toString('hex');
  user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.passwordResetExpires = new Date(Date.now() + RESET_TOKEN_EXPIRY_MS);
  await user.save();

  return resetToken; // Caller sends this via email
};

// ── Reset Password ────────────────────────────────────────────────────────
export const resetPassword = async (token: string, newPassword: string) => {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: new Date() },
  }).select('+password');

  if (!user) {
    const err = new Error('Invalid or expired reset token') as any;
    err.statusCode = 400;
    err.code = 'INVALID_REQUEST';
    throw err;
  }

  user.password = newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.loginAttempts = 0;
  user.lockUntil = undefined;
  user.refreshTokens = []; // Revoke all sessions on password reset
  await user.save();
};

// ── Helper ────────────────────────────────────────────────────────────────
const createAuthSession = async (
  user: any,
  deviceInfo?: string
): Promise<{ user: any; accessToken: string; refreshToken: string }> => {
  const tokenPayload = {
    _id: user._id.toString(),
    email: user.email,
    role: user.role,
  };
  const accessToken = signAccessToken(tokenPayload);
  const refreshToken = signRefreshToken(tokenPayload);

  const tokenHash = await bcrypt.hash(refreshToken, 10);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  user.refreshTokens.push({ tokenHash, createdAt: new Date(), expiresAt, deviceInfo });
  if (user.refreshTokens.length > 5) {
    user.refreshTokens.splice(0, user.refreshTokens.length - 5);
  }

  await user.save();

  return { user: sanitizeUser(user), accessToken, refreshToken };
};

const sanitizeUser = (user: any) => {
  const obj = user.toObject ? user.toObject() : user;
  delete obj.password;
  delete obj.refreshTokens;
  delete obj.passwordResetToken;
  delete obj.passwordResetExpires;
  return obj;
};
