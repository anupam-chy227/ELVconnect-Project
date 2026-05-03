import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { OAuth2Client } from 'google-auth-library';
import * as authService from './auth.service';
import { env } from '../../config/env';
import { isDBConnected } from '../../config/db';
import { signAccessToken, signRefreshToken } from '../../utils/jwt';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/',
};

export const registerCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user, accessToken, refreshToken } = await authService.registerCustomer(req.body);
    res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);
    res.status(201).json({ success: true, data: { user, accessToken } });
  } catch (error) {
    next(error);
  }
};

export const registerServiceProvider = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user, accessToken, refreshToken } = await authService.registerServiceProvider(req.body);
    res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);
    res.status(201).json({ success: true, data: { user, accessToken } });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const deviceInfo = req.headers['user-agent'];
    const { user, accessToken, refreshToken } = await authService.login(req.body, deviceInfo);

    // Refresh token in HttpOnly cookie, access token in response body
    res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);

    res.status(200).json({
      success: true,
      data: { user, accessToken },
    });
  } catch (error) {
    next(error);
  }
};

export const googleAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const deviceInfo = req.headers['user-agent'];
    const { user, accessToken, refreshToken } = await authService.googleAuth(req.body, deviceInfo);

    res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);

    res.status(200).json({
      success: true,
      data: { user, accessToken },
    });
  } catch (error) {
    next(error);
  }
};

export const googleStart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET || !env.GOOGLE_REDIRECT_URI) {
      res.redirect(`${env.CLIENT_URL}/login?google=not_configured`);
      return;
    }

    const client = new OAuth2Client(
      env.GOOGLE_CLIENT_ID,
      env.GOOGLE_CLIENT_SECRET,
      env.GOOGLE_REDIRECT_URI
    );
    const role = req.query.role === 'service_provider' ? 'service_provider' : 'customer';
    const url = client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'select_account',
      scope: ['openid', 'email', 'profile'],
      state: role,
    });
    res.redirect(url);
  } catch (error) {
    next(error);
  }
};

export const googleSetup = async (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    data: {
      clientId: env.GOOGLE_CLIENT_ID,
      redirectUri: env.GOOGLE_REDIRECT_URI,
      clientUrl: env.CLIENT_URL,
      requiredGoogleConsoleValues: {
        authorizedJavaScriptOrigins: [
          'http://localhost:3000',
          'http://127.0.0.1:3000',
        ],
        authorizedRedirectUris: [
          env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/v1/auth/google/callback',
        ],
      },
    },
  });
};

export const googleCallback = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET || !env.GOOGLE_REDIRECT_URI) {
      res.redirect(`${env.CLIENT_URL}/login?google=not_configured`);
      return;
    }

    const code = String(req.query.code || '');
    const role: 'customer' | 'service_provider' =
      req.query.state === 'service_provider' ? 'service_provider' : 'customer';
    const client = new OAuth2Client(
      env.GOOGLE_CLIENT_ID,
      env.GOOGLE_CLIENT_SECRET,
      env.GOOGLE_REDIRECT_URI
    );
    const { tokens } = await client.getToken(code);

    if (!tokens.id_token) {
      res.redirect(`${env.CLIENT_URL}/login?google=missing_token`);
      return;
    }

    if (!isDBConnected()) {
      const ticket = await client.verifyIdToken({
        idToken: tokens.id_token,
        audience: env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      const email = payload?.email?.toLowerCase();

      if (!email || !payload?.email_verified) {
        res.redirect(`${env.CLIENT_URL}/login?google=unverified_email`);
        return;
      }

      const tokenPayload = {
        _id: payload.sub || email,
        email,
        role,
      };
      const accessToken = signAccessToken(tokenPayload);
      const refreshToken = signRefreshToken(tokenPayload);

      res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);
      res.redirect(`${env.CLIENT_URL}/auth/google/callback?accessToken=${encodeURIComponent(accessToken)}&mode=dev-db-offline`);
      return;
    }

    const { accessToken, refreshToken } = await authService.googleAuth({
      credential: tokens.id_token,
      role,
    });

    res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);
    res.redirect(`${env.CLIENT_URL}/auth/google/callback?accessToken=${encodeURIComponent(accessToken)}`);
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const incomingRefreshToken = req.cookies?.refreshToken;

    if (!incomingRefreshToken) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'No refresh token' },
      });
      return;
    }

    const { accessToken, refreshToken } = await authService.refreshAccessToken(incomingRefreshToken);

    res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);

    res.status(200).json({ success: true, data: { accessToken } });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (req.user && refreshToken) {
      await authService.logout(req.user._id, refreshToken);
    }

    res.clearCookie('refreshToken', { path: '/' });
    res.status(200).json({ success: true, data: { message: 'Logged out successfully' } });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const resetToken = await authService.forgotPassword(req.body.email);
    // TODO: Send email with reset link containing resetToken
    // For now, return generic message (prevents enumeration)
    res.status(200).json({
      success: true,
      data: { message: 'If that email exists, a password reset link has been sent' },
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await authService.resetPassword(req.body.token, req.body.newPassword);
    res.clearCookie('refreshToken', { path: '/' });
    res.status(200).json({
      success: true,
      data: { message: 'Password reset successfully. Please log in again.' },
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!isDBConnected()) {
      const email = req.user?.email || 'google-user@elvconnect.local';
      res.status(200).json({
        success: true,
        data: {
          user: {
            _id: req.user?._id || email,
            email,
            role: req.user?.role || 'customer',
            profile: {
              fullName: email.split('@')[0],
              phone: 'Google account',
            },
          },
        },
      });
      return;
    }

    if (env.NODE_ENV === 'development' && req.user?.email && !Types.ObjectId.isValid(req.user._id)) {
      res.status(200).json({
        success: true,
        data: {
          user: {
            _id: req.user._id,
            email: req.user.email,
            role: req.user.role,
            profile: {
              fullName: req.user.email.split('@')[0],
              phone: 'Google account',
            },
          },
        },
      });
      return;
    }

    const { User } = await import('../users/user.model');
    const user = await User.findById(req.user?._id);
    if (!user) {
      if (env.NODE_ENV === 'development' && req.user?.email) {
        res.status(200).json({
          success: true,
          data: {
            user: {
              _id: req.user._id,
              email: req.user.email,
              role: req.user.role,
              profile: {
                fullName: req.user.email.split('@')[0],
                phone: 'Google account',
              },
            },
          },
        });
        return;
      }

      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found' } });
      return;
    }
    res.status(200).json({ success: true, data: { user } });
  } catch (error) {
    next(error);
  }
};
