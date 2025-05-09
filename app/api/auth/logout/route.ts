import { NextResponse } from 'next/server';

// POST /api/auth/logout - Logout a user
export async function POST() {
  // Create a response
  const response = NextResponse.json({ success: true });
  
  // Clear the token cookie
  response.cookies.delete({
    name: 'token',
    path: '/',
  });
  
  return response;
} 