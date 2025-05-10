import { fetcher, handleError, formatPrice } from './utils';

// Define API URL based on environment - use relative URLs
const getApiUrl = () => {
  // Always use relative URLs to avoid CORS and domain issues
  return '/api';
};

const API_URL = getApiUrl();

// Request cache to improve performance (simple in-memory cache)
const requestCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

// Helper to create a cache key from a URL and query params
const createCacheKey = (url: string, params?: Record<string, any>): string => {
  if (!params) return url;
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&');
  return `${url}?${sortedParams}`;
};

// Define types for location coordinates
export interface Coordinates {
  lat: number;
  lng: number;
}

// Define property types for strong typing
export interface Property {
  _id: string;
  title: string;
  price: number;
  currency: string;
  period: string;
  bedrooms: number;
  bathrooms: number;
  location: string;
  distance?: string;
  image: string;
  images?: string[];
  type: string;
  available: boolean;
  isVerified?: boolean;
  isNew?: boolean;
  amenities?: string[];
  size?: number;
  createdAt?: string;
  updatedAt?: string;
  coordinates?: Coordinates; 
  description?: string;
  features?: string[];
  landlord?: {
    name: string;
    email?: string;
    phone?: string;
    verified?: boolean;
  };
  reviews?: Array<{
    id?: string | number;
    user: string;
    date: string;
    rating: number;
    comment: string;
  }>;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    total: number;
    limit: number;
  };
}

// Helper function to ensure property data has valid image URLs
function ensureValidPropertyImages(property: Property): Property {
  const defaultImage = '/images/property-placeholder.jpg';
  
  // Make sure the main image exists
  if (!property.image || !isValidImageUrl(property.image)) {
    property.image = defaultImage;
  }
  
  // Make sure images array exists and is valid
  if (!property.images || !Array.isArray(property.images) || property.images.length === 0) {
    property.images = [property.image];
  } else {
    // Filter out invalid image URLs
    property.images = property.images.filter(img => isValidImageUrl(img));
    if (property.images.length === 0) {
      property.images = [defaultImage];
    }
  }
  
  return property;
}

// Helper function to validate image URLs
function isValidImageUrl(url: string): boolean {
  if (!url) return false;
  
  // Check if it's a valid URL or relative path
  try {
    if (url.startsWith('/')) {
      return true; // Valid relative path
    }
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Property service with caching and improved error handling
export const propertyService = {
  // Get all properties with optional filters and caching
  async getAll(filters = {}, useCache = true): Promise<Property[]> {
    try {
      // Build query string from filters
      const queryParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          // Handle array values (like amenities)
          if (Array.isArray(value) && value.length > 0) {
            queryParams.set(key, value.join(','));
          } else {
            queryParams.set(key, String(value));
          }
        }
      });
      
      const queryString = queryParams.toString();
      const url = `${API_URL}/properties${queryString ? `?${queryString}` : ''}`;
      const cacheKey = createCacheKey(url);
      
      // Check cache first if enabled
      if (useCache) {
        const cached = requestCache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
          return cached.data.properties.map(ensureValidPropertyImages) || [];
        }
      }
      
      console.log('Fetching properties from:', url);
      const response = await fetcher<{properties: Property[]}>(url);
      
      // Ensure valid property images
      const validatedProperties = response.properties.map(ensureValidPropertyImages);
      
      // Cache the result
      if (useCache) {
        requestCache.set(cacheKey, { 
          data: { ...response, properties: validatedProperties }, 
          timestamp: Date.now() 
        });
      }
      
      console.log('API response properties:', validatedProperties?.length || 0);
      return validatedProperties || [];
    } catch (error) {
      console.error('Failed to fetch properties:', error);
      return [];
    }
  },
  
  // Get a property by ID with optional caching
  async getById(id: string, useCache = true): Promise<Property | null> {
    if (!id) return null;
    
    try {
      const url = `${API_URL}/properties/${id}`;
      const cacheKey = url;
      
      // Check cache first if enabled
      if (useCache) {
        const cached = requestCache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
          return ensureValidPropertyImages(cached.data);
        }
      }
      
      console.log(`Fetching property with ID: ${id}`);
      const property = await fetcher<Property>(url);
      
      // Validate property images
      const validatedProperty = property ? ensureValidPropertyImages(property) : null;
      
      // Cache the result
      if (useCache && validatedProperty) {
        requestCache.set(cacheKey, { 
          data: validatedProperty, 
          timestamp: Date.now() 
        });
      }
      
      return validatedProperty;
    } catch (error) {
      console.error(`Failed to fetch property with ID ${id}:`, error);
      return null;
    }
  },
  
  // Get featured properties with caching
  async getFeatured(limit = 4, useCache = true): Promise<Property[]> {
    try {
      // Check for appropriate API URL
      if (!API_URL) {
        console.error('API_URL not defined');
        return [];
      }
      
      const url = `${API_URL}/properties?featured=true&limit=${limit}`;
      const cacheKey = url;
      
      // Check cache first if enabled
      if (useCache) {
        const cached = requestCache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
          console.log('Using cached featured properties');
          return cached.data.properties.map(ensureValidPropertyImages) || [];
        }
      }
      
      console.log('Fetching featured properties from:', url);
      
      // Try with retry mechanism for better reliability
      let attempts = 0;
      const maxAttempts = 3;
      let lastError: any = null;
      
      while (attempts < maxAttempts) {
        try {
          const response = await fetcher<{properties: Property[]}>(url);
          
          // Validate property images
          const validatedProperties = response.properties.map(ensureValidPropertyImages);
          
          // Cache the result
          if (useCache) {
            requestCache.set(cacheKey, { 
              data: { ...response, properties: validatedProperties },
              timestamp: Date.now() 
            });
          }
          
          console.log(`Successfully fetched ${validatedProperties.length || 0} featured properties`);
          return validatedProperties || [];
        } catch (error) {
          attempts++;
          lastError = error;
          console.error(`Attempt ${attempts}/${maxAttempts} to fetch featured properties failed:`, error);
          
          // Wait before retry (exponential backoff)
          if (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
          }
        }
      }
      
      // All attempts failed
      console.error('Failed to fetch featured properties after multiple attempts');
      return [];
    } catch (error) {
      console.error('Failed to fetch featured properties:', error);
      return [];
    }
  },
  
  // Search properties with improved filtering
  async search(filters: Record<string, any>, useCache = false): Promise<Property[]> {
    try {
      // Convert filters to query string
      const queryParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '' && 
            (key !== 'propertyType' || value !== 'all') && 
            (key !== 'bedrooms' || value !== 'any') && 
            (key !== 'bathrooms' || value !== 'any')) {
          
          // Handle array values (like amenities)
          if (Array.isArray(value) && value.length > 0) {
            queryParams.set(key, value.join(','));
          } else {
            queryParams.set(key, String(value));
          }
        }
      });
      
      // Add sort parameter if specified
      if (filters.sort) {
        queryParams.set('sort', filters.sort as string);
      }
      
      const queryString = queryParams.toString();
      const url = `${API_URL}/properties${queryString ? `?${queryString}` : ''}`;
      const cacheKey = createCacheKey(url);
      
      // Check cache first if enabled
      if (useCache) {
        const cached = requestCache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
          return cached.data.properties || [];
        }
      }
      
      const response = await fetcher<{properties: Property[]}>(url);
      
      // Cache the result
      if (useCache) {
        requestCache.set(cacheKey, { 
          data: response, 
          timestamp: Date.now() 
        });
      }
      
      return response.properties || [];
    } catch (error) {
      console.error('Failed to search properties:', error);
      return [];
    }
  },
  
  // Create a new property
  async create(propertyData: Partial<Property>): Promise<Property> {
    try {
      const property = await fetcher<Property>(`${API_URL}/properties`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(propertyData)
      });
      
      // Clear all property caches since we've added a new property
      clearPropertyCaches();
      
      return property;
    } catch (error) {
      console.error('Failed to create property:', error);
      throw error;
    }
  },
  
  // Update an existing property
  async update(id: string, propertyData: Partial<Property>): Promise<Property> {
    try {
      const property = await fetcher<Property>(`${API_URL}/properties/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(propertyData)
      });
      
      // Clear specific property cache and any property lists
      requestCache.delete(`${API_URL}/properties/${id}`);
      clearPropertyCaches();
      
      return property;
    } catch (error) {
      console.error(`Failed to update property with ID ${id}:`, error);
      throw error;
    }
  },
  
  // Delete a property
  async delete(id: string): Promise<boolean> {
    try {
      await fetcher(`${API_URL}/properties/${id}`, {
        method: 'DELETE'
      });
      
      // Clear specific property cache and any property lists
      requestCache.delete(`${API_URL}/properties/${id}`);
      clearPropertyCaches();
      
      return true;
    } catch (error) {
      console.error(`Failed to delete property with ID ${id}:`, error);
      throw error;
    }
  },
  
  // Format property price with correct currency
  formatPrice(property: Property): string {
    return `${property.currency} ${formatPrice(property.price)}`;
  },
  
  // Get a property's full address
  getFullAddress(property: Property): string {
    return property.location;
  }
};

// Helper function to clear all property-related caches
function clearPropertyCaches() {
  // Clear all entries that start with the properties endpoint
  requestCache.forEach((_, key) => {
    if (key.includes('/properties')) {
      requestCache.delete(key);
    }
  });
}

// Authentication service
export const authService = {
  async login(email: string, password: string): Promise<User | null> {
    try {
      const response = await fetcher<{ user: User, token: string }>(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      // Store token in localStorage
      if (response.token) {
        localStorage.setItem('token', response.token);
      }
      
      return response.user;
    } catch (error) {
      console.error('Login failed:', error);
      return null;
    }
  },
  
  async register(userData: Record<string, any>): Promise<User | null> {
    try {
      const response = await fetcher<{ user: User, token: string }>(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      
      // Store token in localStorage
      if (response.token) {
        localStorage.setItem('token', response.token);
      }
      
      return response.user;
    } catch (error) {
      console.error('Registration failed:', error);
      return null;
    }
  },
  
  async getCurrentUser(): Promise<User | null> {
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        return null;
      }
      
      const response = await fetcher<{ user: User }>(`${API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      return response.user;
    } catch (error) {
      // Don't log this as an error, as it will happen when not logged in
      localStorage.removeItem('token');
      return null;
    }
  },
  
  async logout(): Promise<boolean> {
    try {
      await fetcher(`${API_URL}/auth/logout`, {
        method: 'POST'
      });
      
      // Remove token from localStorage
      localStorage.removeItem('token');
      
      return true;
    } catch (error) {
      console.error('Logout failed:', error);
      return false;
    }
  },
  
  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }
};

// User-related types
export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  phone?: string;
  isVerified: boolean;
  createdAt: string;
} 