import { authService } from '@/lib/services/auth-service';
import { IUser } from '@/lib/models/user';

/**
 * Helper function to get the current user from a request
 * Uses headers set by middleware
 */
export async function getCurrentUser(req: Request): Promise<IUser | null> {
  try {
    const userId = req.headers.get('x-user-id');
    const userRole = req.headers.get('x-user-role');
    
    if (!userId || !userRole) {
      return null;
    }
    
    // Get user from database (includes most up-to-date information)
    return await authService.getUserById(userId);
  } catch (error) {
    // Safe error logging without exposing details
    console.error('Error in getCurrentUser:', error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
} 