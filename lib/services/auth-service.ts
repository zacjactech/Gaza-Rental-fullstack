import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/user';
import { handleError } from '../utils';
import crypto from 'crypto';

// Get JWT secret from environment variables with validation and proper development fallback
const JWT_SECRET = process.env.JWT_SECRET || (
  process.env.NODE_ENV === 'production' 
    ? null 
    : crypto.randomBytes(64).toString('hex') // Generate a secure random secret for development
);

// Log appropriate warnings about JWT_SECRET
if (!process.env.JWT_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    console.error('CRITICAL ERROR: JWT_SECRET is not defined in environment variables.');
    console.error('Authentication will not work in production without a proper JWT_SECRET.');
    console.error('Please set this environment variable immediately.');
    // In production, we want to fail hard and fast with no fallbacks
    throw new Error('JWT_SECRET must be defined in production environments');
  } else {
    console.warn('Warning: JWT_SECRET is not defined in environment variables.');
    console.warn('A random secret will be generated for development, but tokens will be invalidated on server restart.');
    console.warn('Run node create-env.js to create a persistent JWT_SECRET.');
  }
}

// Default to 7 days if not specified
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Generate JWT token for a user
function generateToken(user: IUser): string {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined. Cannot generate token.');
  }
  
  return jwt.sign(
    { 
      id: user._id,
      email: user.email,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

// Verify JWT token
function verifyToken(token: string): any {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined. Cannot verify token.');
  }
  
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token');
    } else if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token expired');
    } else {
      throw new Error('Token verification failed');
    }
  }
}

// Edge-compatible token verification (no database access)
function verifyTokenEdge(token: string): { id: string; email: string; role: string } {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: string };
    return decoded;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

// Authentication service
export const authService = {
  // Register a new user
  async register(userData: { 
    name: string;
    email: string;
    password: string;
    role?: 'tenant' | 'landlord' | 'admin';
    phone?: string;
  }): Promise<{ user: IUser; token: string }> {
    try {
      // Check if user already exists
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Create new user
      const user = new User(userData);
      await user.save();

      // Generate token
      const token = generateToken(user);

      return { user, token };
    } catch (error) {
      throw new Error(handleError(error));
    }
  },

  // Login a user
  async login(email: string, password: string): Promise<{ user: IUser; token: string }> {
    try {
      // Find user by email
      const user = await User.findOne({ email });
      
      if (!user) {
        throw new Error('Invalid credentials');
      }
      
      // Check password - comparePassword is synchronous
      const isPasswordValid = user.comparePassword(password);
      
      if (!isPasswordValid) {
        throw new Error('Invalid credentials');
      }

      // Generate token
      const token = generateToken(user);

      return { user, token };
    } catch (error) {
      // Return the original error or its message without wrapping in a new Error
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(String(error));
    }
  },

  // Get user by ID
  async getUserById(userId: string): Promise<IUser> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }
      return user;
    } catch (error) {
      throw new Error(handleError(error));
    }
  },

  // Verify token and get user
  async validateToken(token: string): Promise<IUser> {
    try {
      const decoded = verifyToken(token);
      const user = await User.findById(decoded.id);
      
      if (!user) {
        throw new Error('User not found');
      }
      
      return user;
    } catch (error) {
      throw new Error(handleError(error));
    }
  }
};

// For edge runtime, use the edge-compatible version
export { generateToken, verifyToken }; 