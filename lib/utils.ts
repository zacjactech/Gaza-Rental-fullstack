import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Custom error handler that formats different error types into readable messages
 */
export function handleError(error: unknown): string {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  if (error instanceof Response) {
    return `API Error: Status ${error.status}`;
  }
  
  return 'An unknown error occurred';
}

/**
 * Fetcher function with error handling for API requests
 */
export async function fetcher<T>(
  url: string, 
  options?: RequestInit
): Promise<T> {
  try {
    // Ensure URL is properly formed
    const isAbsoluteUrl = url.startsWith('http://') || url.startsWith('https://');
    
    // For client-side, use the current origin as base
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    
    // Construct the full URL properly
    let fullUrl = url;
    if (!isAbsoluteUrl) {
      // Make sure URL starts with a slash
      const urlPath = url.startsWith('/') ? url : `/${url}`;
      fullUrl = `${baseUrl}${urlPath}`;
    }
    
    // If the URL contains localhost with port 3000, replace it with the current origin
    // This fixes issues when Next.js switches to a different port
    if (isAbsoluteUrl && fullUrl.includes('localhost:3000') && typeof window !== 'undefined') {
      fullUrl = fullUrl.replace('localhost:3000', window.location.host);
    }
    
    console.log(`Fetching from: ${fullUrl}`);
    
    const response = await fetch(fullUrl, {
      ...options,
      // Always include credentials for auth cookies
      credentials: 'include',
      // Include headers from options or use defaults
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {})
      }
    });
    
    // Parse JSON response
    const data = await response.json();
    
    // Handle API error responses
    if (!response.ok) {
      // Get error message from API response if available
      const errorMessage = data.error || `Failed with status: ${response.status}`;
      throw new Error(errorMessage);
    }
    
    return data as T;
  } catch (error) {
    console.error('API request failed:', error);
    // Enhance error message for network errors
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error('Network error: Could not connect to the server. Please check your internet connection and try again.');
    }
    throw error;
  }
}

/**
 * Format price with proper currency symbol and thousand separators
 */
export function formatPrice(price: number, currency = 'TZS', locale = 'en-US'): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  } catch (error) {
    console.error('Error formatting price:', error);
    return price.toString();
  }
}

/**
 * Helper to safely access deep nested objects with optional chaining
 */
export function getNestedValue<T>(obj: any, path: string, defaultValue: T): T {
  const keys = path.split('.');
  let result = obj;
  
  for (const key of keys) {
    if (result === undefined || result === null || typeof result !== 'object') {
      return defaultValue;
    }
    result = result[key];
  }
  
  return (result === undefined || result === null) ? defaultValue : result as T;
}

/**
 * Debounce function to limit how often a function can be called
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function(...args: Parameters<T>) {
    if (timeout) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

/**
 * Generate a random ID for client-side use
 */
export function generateId(prefix = ''): string {
  return `${prefix}${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Helper to safely parse JSON with error handling
 */
export function safelyParseJSON<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch (error) {
    console.error('Error parsing JSON:', error);
    return fallback;
  }
}

// Type-safe localStorage wrapper
export const storage = {
  get: <T>(key: string, defaultValue: T): T => {
    if (typeof window === 'undefined') return defaultValue;
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error getting ${key} from localStorage:`, error);
      return defaultValue;
    }
  },
  set: <T>(key: string, value: T): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting ${key} in localStorage:`, error);
    }
  },
  remove: (key: string): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing ${key} from localStorage:`, error);
    }
  }
};

/**
 * Consistent error handling utility for API responses
 * @param error Any error object or message
 * @returns Formatted error object with standard structure
 */
export function createApiError(error: unknown) {
  let status = 500;
  let message = 'Internal server error';
  let code = 'INTERNAL_SERVER_ERROR';
  
  if (error instanceof Error) {
    message = error.message;
    
    // Handle known error types
    if (error.name === 'ValidationError') {
      status = 400;
      code = 'VALIDATION_ERROR';
    } else if (error.name === 'UnauthorizedError') {
      status = 401;
      code = 'UNAUTHORIZED';
    } else if (error.name === 'ForbiddenError') {
      status = 403;
      code = 'FORBIDDEN';
    } else if (error.name === 'NotFoundError') {
      status = 404;
      code = 'NOT_FOUND';
    }
  } else if (typeof error === 'string') {
    message = error;
  }
  
  // Extract custom error info if available
  if ((error as any).status) {
    status = (error as any).status;
  }
  if ((error as any).code) {
    code = (error as any).code;
  }
  
  // Log the error for debugging (but not in tests)
  if (process.env.NODE_ENV !== 'test') {
    console.error(`API Error [${code}]:`, message);
  }
  
  return {
    status,
    body: {
      error: {
        message,
        code,
        timestamp: new Date().toISOString()
      }
    }
  };
}

/**
 * Custom error classes for specific error types
 */
export class ValidationError extends Error {
  name = 'ValidationError';
  status = 400;
  constructor(message: string) {
    super(message);
  }
}

export class UnauthorizedError extends Error {
  name = 'UnauthorizedError';
  status = 401;
  constructor(message = 'Unauthorized') {
    super(message);
  }
}

export class ForbiddenError extends Error {
  name = 'ForbiddenError';
  status = 403;
  constructor(message = 'Forbidden') {
    super(message);
  }
}

export class NotFoundError extends Error {
  name = 'NotFoundError';
  status = 404;
  constructor(message = 'Not found') {
    super(message);
  }
}
