import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname;
  
  // Get the token from the cookies
  const token = request.cookies.get('token')?.value;
  
  // Define public routes that don't require authentication
  const publicRoutes = ['/', '/login', '/register', '/about', '/contact', '/browse', '/properties'];
  
  // Check if the path is a public route
  const isPublicRoute = publicRoutes.some(route => path === route || path.startsWith(`${route}/`));
  
  // Check if the path is a dashboard route
  const isDashboardRoute = path.startsWith('/dashboard');
  
  // If it's a dashboard route and there's no token, redirect to login
  if (isDashboardRoute && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Allow the request to proceed
  return NextResponse.next();
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    '/dashboard/:path*',
  ],
}; 