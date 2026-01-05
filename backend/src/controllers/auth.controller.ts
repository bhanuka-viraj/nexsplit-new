import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';
import { ApiResponse } from '../utils/ApiResponse';

import { OAuth2Client } from 'google-auth-library';
import { User } from '../models/user.model';

const client = new OAuth2Client(env.GOOGLE_CLIENT_ID);

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// ... (imports remain)

export const signup = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password, name } = req.body;

        if (!email || !password || !name) {
            return ApiResponse.error(res, 'Name, email, and password are required', 400);
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return ApiResponse.error(res, 'User already exists', 409);
        }

        // Hash Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create User
        const user = await User.create({
            email,
            password: hashedPassword,
            name,
            monthlyLimit: 2000, 
            currency: 'USD'
        });

        // Generate Token
        const accessToken = jwt.sign(
            { id: user._id, email: user.email },
            env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        // Remove password from response
        const userResponse = user.toObject();
        delete userResponse.password;

        ApiResponse.created(res, { user: userResponse, accessToken }, 'Account created successfully');

    } catch (error) {
        next(error);
    }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return ApiResponse.error(res, 'Email and password are required', 400);
        }

        // Find user and explicitly select password
        const user = await User.findOne({ email }).select('+password');
        if (!user || !user.password) {
            // Check !user.password specifically to handle Google-only accounts that might not have a password set yet
            return ApiResponse.error(res, 'Invalid credentials', 401);
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return ApiResponse.error(res, 'Invalid credentials', 401);
        }

        const accessToken = jwt.sign(
            { id: user._id, email: user.email },
            env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        const userResponse = user.toObject();
        delete userResponse.password;

        ApiResponse.success(res, { user: userResponse, accessToken }, 'Logged in successfully');

    } catch (error) {
        next(error);
    }
};

export const verifyGoogleToken = async (req: Request, res: Response, next: NextFunction) => {
// ... (rest of verifyGoogleToken)
  try {
    const { token } = req.body;
    if (!token) {
        return ApiResponse.error(res, 'Token is required', 400);
    }

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    
    if (!payload || !payload.email) {
        return ApiResponse.error(res, 'Invalid token payload', 400);
    }

    // Find or Create User
    let user = await User.findOne({ googleId: payload.sub });
    if (!user) {
        user = await User.findOne({ email: payload.email });
        if (user) {
            // Link googleId if user exists by email
            user.googleId = payload.sub;
            if (!user.avatarUrl && payload.picture) user.avatarUrl = payload.picture;
            await user.save();
        } else {
            // Create New User
            user = await User.create({
                googleId: payload.sub,
                email: payload.email,
                name: payload.name || 'User',
                avatarUrl: payload.picture,
            });
        }
    }

    // Generate Access Token (Long-lived for mobile)
    const accessToken = jwt.sign(
        { id: user._id, email: user.email },
        env.JWT_SECRET,
        { expiresIn: '30d' }
    );

    ApiResponse.success(res, { user, accessToken }, 'Authenticated successfully');

  } catch (error) {
      next(error);
  }
};

export const logout = (req: Request, res: Response, next: NextFunction) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    // Clear session cookie effectively
    req.session.destroy((destroyErr) => {
        if (destroyErr) {
            return next(destroyErr);
        }
        res.clearCookie('connect.sid'); // Default cookie name
        ApiResponse.success(res, null, 'Logged out successfully');
    });
  });
};

export const getSession = (req: Request, res: Response) => {
  if (req.isAuthenticated()) {
    res.json({ isAuthenticated: true, user: req.user });
  } else {
    res.json({ isAuthenticated: false, user: null });
  }
};
