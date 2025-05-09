import { NextResponse } from 'next/server';
import { userService } from '@/lib/services/user-service';
import { handleError } from '@/lib/utils';
import { connectToDatabase } from '@/lib/db';
import { verifyToken } from '@/lib/services/auth-service';

// POST /api/users/change-password - Change user password
export async function POST(request: Request) {
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
    
    // Validate required fields
    const requiredFields = ['currentPassword', 'newPassword'];
    
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }
    
    // Validate password length
    if (data.newPassword.length < 6) {
      return NextResponse.json(
        { error: 'New password must be at least 6 characters long' },
        { status: 400 }
      );
    }
    
    // Change password
    const success = await userService.changePassword(
      userData.id,
      data.currentPassword,
      data.newPassword
    );
    
    return NextResponse.json({ success });
  } catch (error) {
    console.error('Error changing password:', error);
    
    // Handle specific error for incorrect current password
    const errorMessage = handleError(error);
    
    if (errorMessage.includes('Current password is incorrect')) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 