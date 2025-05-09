import { NextResponse } from 'next/server';
import { getConnectionPromise } from '../db-init';
import { verifyToken } from '../services/auth-service';
import { handleError } from '../utils';

/**
 * Wrapper for API handlers that ensures database connection and authentication
 * @param handler The API handler function
 * @param requireAuth Whether authentication is required (default: true)
 */
export function withDatabase(
  handler: (req: Request, token?: string, userData?: any) => Promise<Response>,
  requireAuth: boolean = true
) {
  return async (req: Request) => {
    try {
      // Ensure database is connected
      await getConnectionPromise();
      
      if (requireAuth) {
        // Get token from authorization header or cookies
        const authHeader = req.headers.get('authorization');
        const headerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
        const cookieToken = req.headers.get('cookie')?.split('; ')
          .find(cookie => cookie.startsWith('token='))
          ?.split('=')[1];
        
        const token = headerToken || cookieToken;
        
        if (!token) {
          return NextResponse.json(
            { error: 'Authentication required' },
            { status: 401 }
          );
        }
        
        // Verify token
        try {
          const userData = verifyToken(token);
          return handler(req, token, userData);
        } catch (error) {
          return NextResponse.json(
            { error: 'Invalid authentication token' },
            { status: 401 }
          );
        }
      } else {
        // No authentication required
        return handler(req);
      }
    } catch (error) {
      console.error('API Error:', error);
      return NextResponse.json(
        { error: handleError(error) },
        { status: 500 }
      );
    }
  };
} 