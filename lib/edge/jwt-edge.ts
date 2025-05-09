/**
 * JWT verification optimized for Edge runtime environments
 * Since the edge runtime doesn't support the full Node.js crypto functionality,
 * this implementation provides basic JWT structure and expiration validation.
 */

export interface JwtPayload {
  id: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

/**
 * Verify a JWT token in Edge runtime
 * Note: This does not validate the signature cryptographically
 * and should be used only for non-critical paths
 */
export function verifyTokenEdge(token: string): JwtPayload {
  if (!token || typeof token !== 'string') {
    throw new Error('Invalid token: Token must be a non-empty string');
  }

  try {
    // Basic JWT structure check
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid token format: Token must have three parts');
    }
    
    // Decode the payload (middle part)
    let payload: JwtPayload;
    try {
      // Using atob for base64 decoding in Edge runtime
      const decodedPayload = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
      payload = JSON.parse(decodedPayload) as JwtPayload;
    } catch (decodeError) {
      throw new Error('Invalid token: Payload is not valid base64 or JSON');
    }
    
    // Validate payload structure
    if (!payload || typeof payload !== 'object') {
      throw new Error('Invalid token: Payload must be an object');
    }
    
    if (!payload.id || !payload.email || !payload.exp) {
      throw new Error('Invalid token: Missing required claims');
    }
    
    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      throw new Error('Token expired');
    }
    
    return payload;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Invalid or expired token');
  }
} 