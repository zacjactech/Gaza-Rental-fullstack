import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { verifyToken } from '@/lib/services/auth-service';
import { userService } from '@/lib/services/user-service';
import { handleError } from '@/lib/utils';

/**
 * POST /api/users/avatar - Upload user avatar
 * Accepts a multipart form with an image file
 */
export async function POST(request: Request) {
  try {
    await connectToDatabase();
    
    // Get token from authorization header or cookies
    let token = request.headers.get('authorization')?.split(' ')[1];
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
    
    const formData = await request.formData();
    const file = formData.get('avatar') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, GIF and WebP are allowed.' },
        { status: 400 }
      );
    }
    
    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB.' },
        { status: 400 }
      );
    }
    
    // Convert file to base64 for storage
    // In a production app, you would use a service like Cloudinary or S3
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = `data:${file.type};base64,${buffer.toString('base64')}`;
    
    // Update user's avatar
    const updatedUser = await userService.updateProfile(userData.id, {
      avatar: base64Image
    });
    
    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      message: 'Avatar updated successfully',
      avatar: base64Image
    });
    
  } catch (error) {
    console.error('Error uploading avatar:', error);
    return NextResponse.json(
      { error: handleError(error) },
      { status: 500 }
    );
  }
} 