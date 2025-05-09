import { NextResponse } from 'next/server';
import { authService } from '@/lib/services/auth-service';
import { handleError } from '@/lib/utils';
import { connectToDatabase } from '@/lib/db';

// POST /api/auth/register - Register a new user
export async function POST(request: Request) {
  try {
    await connectToDatabase();
    
    // Parse request body
    const data = await request.json();
    
    // Validate required fields
    const requiredFields = ['name', 'email', 'password'];
    
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }
    
    // Validate email format
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(data.email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }
    
    // Validate password length
    if (data.password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }
    
    // Register user
    const result = await authService.register({
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role || 'tenant',
      phone: data.phone
    });
    
    // Set JWT token as cookie for browser-based auth
    const response = NextResponse.json(
      { user: result.user },
      { status: 201 }
    );
    
    // Set secure HTTP-only cookie with token
    response.cookies.set({
      name: 'token',
      value: result.token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    });
    
    return response;
  } catch (error) {
    console.error('Error registering user:', error);
    
    // Handle specific errors
    const errorMessage = handleError(error);
    
    if (errorMessage.includes('User with this email already exists')) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 