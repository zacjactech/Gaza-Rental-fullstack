/**
 * Map Utilities
 * Common configuration and helper functions for maps using OpenStreetMap
 */

import type { LatLngTuple } from 'leaflet';

/**
 * Default map configuration values 
 */
export const MAP_CONFIG = {
  // Default center coordinates (Dar es Salaam, Tanzania)
  DEFAULT_CENTER: getDefaultCenter(),
  
  // Default zoom level
  DEFAULT_ZOOM: getDefaultZoom(),
  
  // Tile layer URL for OpenStreetMap
  TILE_LAYER: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  
  // Attribution for OpenStreetMap
  ATTRIBUTION: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  
  // Additional tile layer options
  TILE_OPTIONS: {
    maxZoom: 19,
    subdomains: ['a', 'b', 'c'],
    detectRetina: true,
    tileSize: 256,
    minZoom: 3,
  }
};

/**
 * Get default center coordinates from environment variables or fallback to default
 */
function getDefaultCenter(): LatLngTuple {
  try {
    // Try to get from env vars
    const envCenter = process.env.MAP_DEFAULT_CENTER;
    
    if (envCenter) {
      const [lat, lng] = envCenter.split(',').map(Number);
      if (!isNaN(lat) && !isNaN(lng)) {
        return [lat, lng];
      }
    }
  } catch (e) {
    console.warn('Error parsing MAP_DEFAULT_CENTER from env variables', e);
  }
  
  // Fallback to Dar es Salaam, Tanzania
  return [-6.776, 39.178];
}

/**
 * Get default zoom level from environment variables or fallback to default
 */
function getDefaultZoom(): number {
  try {
    const envZoom = process.env.MAP_DEFAULT_ZOOM;
    
    if (envZoom) {
      const zoom = parseInt(envZoom, 10);
      if (!isNaN(zoom)) {
        return zoom;
      }
    }
  } catch (e) {
    console.warn('Error parsing MAP_DEFAULT_ZOOM from env variables', e);
  }
  
  // Fallback to zoom level 13
  return 13;
}

/**
 * Sanitize coordinates to ensure they are valid
 */
export function sanitizeCoordinates(coords: any): LatLngTuple {
  if (Array.isArray(coords) && coords.length === 2 && 
      !isNaN(Number(coords[0])) && !isNaN(Number(coords[1]))) {
    // Valid coordinates
    return [Number(coords[0]), Number(coords[1])];
  }
  
  // Invalid coordinates, return default
  return MAP_CONFIG.DEFAULT_CENTER;
}

/**
 * Convert address to coordinates using OpenStreetMap Nominatim API
 * Note: For high-volume production use, you should use a self-hosted instance
 * or a commercial geocoding service due to usage limits
 */
export async function geocodeAddress(address: string): Promise<LatLngTuple | null> {
  try {
    // Format address for URL
    const formattedAddress = encodeURIComponent(address);
    
    // Call Nominatim API
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${formattedAddress}`,
      {
        headers: {
          'User-Agent': 'GazaRental/1.0'  // Required by Nominatim usage policy
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`Geocoding error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data && data.length > 0) {
      const { lat, lon } = data[0];
      return [Number(lat), Number(lon)];
    }
    
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

/**
 * Format coordinates for display
 */
export function formatCoordinates(coords: LatLngTuple): string {
  return `${coords[0].toFixed(6)}, ${coords[1].toFixed(6)}`;
}

// Create a named export object
const mapUtils = {
  MAP_CONFIG,
  sanitizeCoordinates,
  geocodeAddress,
  formatCoordinates
};

export default mapUtils; 