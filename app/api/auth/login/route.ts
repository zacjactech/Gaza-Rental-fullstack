import { NextResponse } from 'next/server';
import { authService } from '@/lib/services/auth-service';
import { handleError } from '@/lib/utils';
import { connectToDatabase } from '@/lib/db';

// POST /api/auth/login - Login a user
export async function POST(request: Request) {
  try {
    await connectToDatabase();
    
    // Parse request body
    const data = await request.json();
    
    // Validate required fields
    if (!data.email || !data.password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }
    
    // Login user
    const result = await authService.login(data.email, data.password);
    
    // Create response with user data
    const response = NextResponse.json({ user: result.user });
    
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
    console.error('Error logging in:', error);
    
    // Pass through the specific error message
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // Handle invalid credentials specifically
    if (errorMessage.includes('Invalid credentials')) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 