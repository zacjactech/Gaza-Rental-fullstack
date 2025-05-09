import { authService, verifyToken } from '@/lib/services/auth-service';
import { IUser } from '@/lib/models/user';

/**
 * Helper function to get the current user from a request
 * Safely extracts token from cookies and verifies it
 */
export async function getCurrentUser(req: Request): Promise<IUser | null> {
  try {
    // More robust token extraction from cookies
    const cookieHeader = req.headers.get('cookie');
    if (!cookieHeader) {
      return null;
    }
    
    // Parse cookies properly
    const cookies = cookieHeader.split(';').reduce<Record<string, string>>((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      if (key && value) {
        acc[key.trim()] = decodeURIComponent(value.trim());
      }
      return acc;
    }, {});
    
    const token = cookies['token'];
    
    if (!token) {
      return null;
    }
    
    try {
      // Verify token without database check (faster)
      const decoded = verifyToken(token);
      
      // Get user from database (includes most up-to-date information)
      return await authService.getUserById(decoded.id);
    } catch (error) {
      // Token verification failed
      return null;
    }
  } catch (error) {
    // Safe error logging without exposing details
    console.error('Error in getCurrentUser:', error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
} 