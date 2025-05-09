import { NextResponse } from 'next/server';
import { authService } from '@/lib/services/auth-service';
import { handleError } from '@/lib/utils';
import { connectToDatabase } from '@/lib/db';

// GET /api/auth/me - Get current user
export async function GET(request: Request) {
  try {
    await connectToDatabase();
    
    // Get the token from the cookies
    const token = request.headers.get('cookie')?.split('; ')
      .find(cookie => cookie.startsWith('token='))
      ?.split('=')[1];
    
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized - No token provided' },
        { status: 401 }
      );
    }
    
    try {
      // Validate token and get user
      const user = await authService.validateToken(token);
      return NextResponse.json({ user });
    } catch (error) {
      // Token validation failed
      const response = NextResponse.json(
        { error: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
      
      // Clear the invalid token cookie
      response.cookies.delete('token');
      
      return response;
    }
  } catch (error) {
    console.error('Error getting current user:', error);
    return NextResponse.json(
      { error: handleError(error) },
      { status: 500 }
    );
  }
} 