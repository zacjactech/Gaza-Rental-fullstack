import { NextResponse } from 'next/server';
import { userService } from '@/lib/services/user-service';
import { handleError } from '@/lib/utils';
import { connectToDatabase } from '@/lib/db';
import { verifyToken } from '@/lib/services/auth-service';

/**
 * GET /api/users/me - Get current authenticated user
 * Returns the current user's data based on their authentication token
 */
export async function GET(request: Request) {
  try {
    // Connect to MongoDB
    await connectToDatabase();
    
    // Try to get token from authorization header
    let token = request.headers.get('authorization')?.split(' ')[1];
    
    // If no token in authorization header, try to get it from cookies
    if (!token) {
      token = request.headers.get('cookie')?.split('; ')
        .find(cookie => cookie.startsWith('token='))
        ?.split('=')[1];
    }
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Verify token and get user
    const userData = verifyToken(token);
    
    // Get user profile
    const user = await userService.getById(userData.id);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Return user data without sensitive information
    return NextResponse.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      phone: user.phone,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      isVerified: user.isVerified,
      preferences: user.preferences,
    });
  } catch (error) {
    console.error('Error fetching current user:', error);
    return NextResponse.json(
      { error: handleError(error) },
      { status: 500 }
    );
  }
} 