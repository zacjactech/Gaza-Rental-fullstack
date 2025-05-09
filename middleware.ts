import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyTokenEdge } from './lib/edge/jwt-edge';

// Paths that require authentication
const protectedPaths = [
  '/dashboard',
  '/profile',
  '/api/properties/create',
  '/api/properties/delete',
  '/api/properties/update',
  '/api/messages',
  '/api/favorites',
  '/api/bookings',
  '/api/messages',
];

// Paths that should redirect to dashboard if already authenticated
const authPaths = [
  '/login',
  '/register',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get token from cookies or authorization header
  const cookieToken = request.cookies.get('token')?.value;
  const authHeader = request.headers.get('authorization');
  const headerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
  const token = cookieToken || headerToken;
  
  // For protected paths, verify token
  if (protectedPaths.some(path => pathname.startsWith(path))) {
    if (!token) {
      // Redirect to login page with original destination
      const url = new URL('/login', request.url);
      url.searchParams.set('from', pathname);
      return NextResponse.redirect(url);
    }
    
    try {
      // Verify the token using Edge-compatible function
      verifyTokenEdge(token);
      
      // Token is valid, continue
      return NextResponse.next();
    } catch (error) {
      // Get specific error message
      const errorMessage = error instanceof Error ? error.message : 'Invalid token';
      console.warn(`Auth middleware: ${errorMessage} - redirecting to login`);
      
      // Token is invalid, redirect to login
      const response = NextResponse.redirect(new URL('/login', request.url));
      
      // Clear the invalid token
      response.cookies.delete('token');
      
      return response;
    }
  }
  
  // For auth paths (login/register), redirect to dashboard if already logged in
  if (authPaths.some(path => pathname.startsWith(path)) && token) {
    try {
      // Verify the token
      verifyTokenEdge(token);
      
      // Token is valid, redirect to dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } catch (error) {
      // Token is invalid, clear it and continue to the login page
      const response = NextResponse.next();
      response.cookies.delete('token');
      return response;
    }
  }
  
  // For all other paths, continue
  return NextResponse.next();
}

// Configure the middleware to run only on specific paths
export const config = {
  matcher: [
    '/',
    '/dashboard/:path*',
    '/profile/:path*',
    '/login',
    '/register',
    '/api/properties/:path*',
    '/api/messages/:path*',
    '/api/favorites/:path*',
    '/api/bookings/:path*',
    '/api/messages/:path*',
  ],
}; 