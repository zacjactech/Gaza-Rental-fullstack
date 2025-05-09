import { NextResponse } from 'next/server';
import { userService } from '@/lib/services/user-service';
import { handleError } from '@/lib/utils';
import { connectToDatabase } from '@/lib/db';
import { verifyToken } from '@/lib/services/auth-service';

// GET /api/users/profile - Get current user profile
export async function GET(request: Request) {
  try {
    // Connect to MongoDB
    await connectToDatabase();
    
    // Get token from cookie (handled by middleware)
    const token = request.headers.get('authorization')?.split(' ')[1];
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
    
    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: handleError(error) },
      { status: 500 }
    );
  }
}

// PATCH /api/users/profile - Update user profile
export async function PATCH(request: Request) {
  try {
    // Connect to MongoDB
    await connectToDatabase();
    
    // Get token from cookie (handled by middleware)
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Verify token and get user
    const userData = verifyToken(token);
    
    // Parse request body
    const data = await request.json();
    
    // Create update object
    const updateData: { name?: string; phone?: string; avatar?: string } = {};
    
    if (data.name !== undefined && data.name.trim()) {
      updateData.name = data.name.trim();
    }
    
    if (data.phone !== undefined) {
      updateData.phone = data.phone;
    }
    
    if (data.avatar !== undefined) {
      updateData.avatar = data.avatar;
    }
    
    // Update profile
    const user = await userService.updateProfile(userData.id, updateData);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(user);
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { error: handleError(error) },
      { status: 500 }
    );
  }
} 