"use client";

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';

// Import types only from leaflet
import type { LatLngTuple } from 'leaflet';

// Don't import Leaflet CSS here - we'll do it in the component
// to ensure it only loads in the client

interface Property {
  id: string | number;
  titleKey?: string;
  title?: string;
  price: number;
  currency: string;
  periodKey?: string;
  period?: string;
  bedrooms: number;
  bathrooms: number;
  locationKey?: string;
  location?: string;
  distance: string;
  image: string;
  coordinates: LatLngTuple;
  type?: string;
  available?: boolean;
}

// Marker interface for simplified usage
interface Marker {
  position: LatLngTuple;
  title: string;
}

interface MapComponentProps {
  // Original props
  properties?: Property[];
  onPropertySelect?: (property: Property) => void;
  onLoad?: () => void;
  onError?: (error: any) => void;
  
  // Additional props for simplified usage
  center?: LatLngTuple;
  zoom?: number;
  markers?: Marker[];
  showSearch?: boolean;
}

const MapComponent = ({ 
  properties = [], 
  onPropertySelect, 
  onLoad, 
  onError,
  center,
  zoom = 13,
  markers = [],
  showSearch = false
}: MapComponentProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [isMapInitialized, setIsMapInitialized] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [attempts, setAttempts] = useState(0);
  const maxAttempts = 3;
  
  // Track component mount status
  const isMountedRef = useRef(true);

  // Add CSS with !important rules to override any conflicting styles
  const mapStyles = `
    .leaflet-container {
      width: 100% !important;
      height: 100% !important;
      z-index: 10 !important;
    }
    
    .leaflet-control-container {
      z-index: 10 !important;
    }
    
    .leaflet-pane {
      z-index: 10 !important;
    }
    
    .leaflet-top, .leaflet-bottom {
      z-index: 10 !important;
    }
    
    .leaflet-div-icon {
      background: transparent !important;
      border: none !important;
    }
    
    .custom-marker {
      display: flex !important;
      justify-content: center !important;
      align-items: center !important;
    }
    
    .custom-popup .leaflet-popup-content-wrapper {
      border-radius: 8px !important;
      box-shadow: 0 3px 14px rgba(0,0,0,0.2) !important;
    }
    
    .custom-popup .leaflet-popup-content {
      margin: 8px !important;
      min-width: 200px !important;
    }
  `;

  // Add styles to head
  useEffect(() => {
    // Add the CSS styles to the document head
    const styleElement = document.createElement('style');
    styleElement.textContent = mapStyles;
    document.head.appendChild(styleElement);

    // Also add Leaflet CSS
    const linkElement = document.createElement('link');
    linkElement.rel = 'stylesheet';
    linkElement.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    linkElement.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
    linkElement.crossOrigin = '';
    document.head.appendChild(linkElement);

    return () => {
      // Clean up the styles on unmount
      document.head.removeChild(styleElement);
      // Don't remove the Leaflet CSS as it might be used by other components
    };
  }, []);

  // Track component mount status
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Initialize the map
  useEffect(() => {
    if (!mapRef.current || hasError || isMapInitialized || attempts >= maxAttempts) {
      return;
    }

    // Set explicit dimensions on container to ensure it's visible
    if (mapRef.current) {
      mapRef.current.style.height = '500px';
      mapRef.current.style.width = '100%';
    }

    const initMap = async () => {
      if (!isMountedRef.current || !mapRef.current) return;
      
      try {
        // Check container dimensions to ensure it's visible
        const { width, height } = mapRef.current.getBoundingClientRect();
        
        if (width < 50 || height < 50) {
          console.warn('Map container has small dimensions', { width, height });
          // Don't throw error, just use default dimensions
          mapRef.current.style.height = '500px';
          mapRef.current.style.width = '100%';
        }
        
        // Dynamic import of Leaflet to ensure it's loaded in client environment
        const L = await import('leaflet').then(mod => mod.default || mod);
        
        // Fix Leaflet icon paths
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        });
        
        // Determine center coordinates
        // Use provided center, or calculate from properties, or use default
        const defaultCenter: LatLngTuple = [-6.776, 39.178]; // Dar es Salaam, Tanzania
        const mapCenter = center || 
          (properties.length > 0 ? properties[0].coordinates : defaultCenter);
        
        // Initialize map with animations disabled for better performance
        const map = L.map(mapRef.current, {
          fadeAnimation: false,
          zoomAnimation: false,
          markerZoomAnimation: false,
          preferCanvas: true // Use canvas renderer for better performance
        }).setView(mapCenter, zoom);
        
        // Store map instance
        mapInstanceRef.current = map;
        setIsMapInitialized(true);
        setIsLoading(false);
        
        // Add tile layer - using OpenStreetMap
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
          // Add additional reliability options
          subdomains: ['a', 'b', 'c'],
          detectRetina: true,
          // Ensure tiles load properly
          tileSize: 256,
          minZoom: 3
        }).addTo(map);
        
        // Create custom marker icon
        const customIcon = L.divIcon({
          className: 'custom-marker',
          html: `<div class="bg-primary text-white rounded-full p-1 flex items-center justify-center shadow-md" style="width: 36px; height: 36px;">
                   <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                 </div>`,
          iconSize: [36, 36],
          iconAnchor: [18, 36],
          popupAnchor: [0, -36]
        });

        // Add markers from properties
        if (properties && properties.length > 0) {
          const validProperties = properties.filter(p => 
            p && p.coordinates && 
            Array.isArray(p.coordinates) && 
            p.coordinates.length === 2
          );
          
          validProperties.forEach(property => {
            try {
              // Safe access with fallbacks
              const propertyTitle = property.title || property.titleKey || 'Property';
              const propertyPrice = typeof property.price === 'number' ? property.price : 0;
              const propertyCurrency = property.currency || 'TZS';
              
              // Create marker
              const marker = L.marker(property.coordinates, { icon: customIcon }).addTo(map);
            
              // Create popup content
              const popupContent = `
                <div class="font-sans p-2">
                  <h3 class="font-semibold text-sm">${propertyTitle}</h3>
                  <p class="text-sm font-medium text-primary">${propertyCurrency} ${propertyPrice.toLocaleString()}/month</p>
                  <button class="mt-2 text-xs bg-primary text-white px-2 py-1 rounded hover:bg-primary/90 w-full">View details</button>
                </div>
              `;
            
              // Add popup
              const popup = L.popup({
                closeButton: false,
                className: 'custom-popup'
              }).setContent(popupContent);
            
              marker.bindPopup(popup);
            
              // Handle marker click with try-catch
              marker.on('click', () => {
                if (onPropertySelect && isMountedRef.current) {
                  onPropertySelect(property);
                }
              });
            } catch (error) {
              console.error('Error creating marker for property:', error);
            }
          });
          
          // If properties exist, fit bounds to include all markers
          if (validProperties.length > 1) {
            try {
              const bounds = L.latLngBounds(validProperties.map(p => p.coordinates));
              map.fitBounds(bounds, { padding: [50, 50] });
            } catch (error) {
              console.error('Error setting map bounds:', error);
            }
          } else if (validProperties.length === 1) {
            map.setView(validProperties[0].coordinates, 15);
          }
        }
        
        // Add markers from the markers prop (simplified usage)
        if (markers.length > 0) {
          markers.forEach(marker => {
            const { position, title } = marker;
            
            // Create marker
            const leafletMarker = L.marker(position, { icon: customIcon }).addTo(map);
          
            // Create popup content
            const popupContent = `
              <div class="font-sans p-2">
                <h3 class="font-semibold text-sm">${title}</h3>
              </div>
            `;
          
            // Add popup
            const popup = L.popup({
              closeButton: false,
              className: 'custom-popup'
            }).setContent(popupContent);
          
            leafletMarker.bindPopup(popup);
          });
          
          // If multiple markers, fit bounds
          if (markers.length > 1) {
            const bounds = L.latLngBounds(markers.map(m => m.position));
            map.fitBounds(bounds, { padding: [50, 50] });
          } else if (markers.length === 1 && !center) {
            // If single marker and no center provided, center on marker
            map.setView(markers[0].position, zoom);
          }
        }
        
        // Add resize handler to handle container size changes
        const handleResize = () => {
          if (mapInstanceRef.current && isMountedRef.current) {
            mapInstanceRef.current.invalidateSize();
          }
        };
        
        window.addEventListener('resize', handleResize);
        
        // Force a resize after a short delay to ensure proper rendering
        setTimeout(handleResize, 500);

        // Call onLoad callback if provided
        if (onLoad && isMountedRef.current) {
          onLoad();
        }
        
        // Cleanup function
        return () => {
          window.removeEventListener('resize', handleResize);
          
          if (mapInstanceRef.current) {
            mapInstanceRef.current.remove();
            mapInstanceRef.current = null;
          }
        };
      } catch (error) {
        console.error("Map initialization error:", error);
        
        setHasError(true);
        
        setErrorMessage(error instanceof Error ? error.message : 'Failed to initialize map');
        if (onError) onError(error);
        
        // Try to reinitialize if within max attempts
        setAttempts(prev => prev + 1);
        if (attempts < maxAttempts - 1) {
          setTimeout(initMap, 1000); // Wait 1 second before retrying
        }
      }
    };

    // Initialize map with a short delay to ensure DOM is ready
    const initTimeout = setTimeout(initMap, 500);
    
    return () => {
      clearTimeout(initTimeout);
    };
  }, [properties, markers, center, zoom, onPropertySelect, onLoad, onError, hasError, isMapInitialized, attempts]);

  return (
    <div className="relative h-full w-full bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
      {/* Map loading state */}
      {isLoading && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 bg-opacity-80 dark:bg-opacity-80 z-10">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">Loading map...</p>
          </div>
        </div>
      )}
      
      {/* Render fallback UI if there's an error */}
      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-gray-100 dark:bg-gray-800">
          <div className="text-center">
            <div className="text-red-500 mb-4">Failed to load map: {errorMessage}</div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">We&apos;re having trouble loading the map. Please try again later.</p>
            <Button 
              onClick={() => {
                setHasError(false);
                setIsMapInitialized(false);
                setAttempts(0);
              }}
              className="mr-2"
            >
              Retry
            </Button>
          </div>
        </div>
      )}
      
      {/* Map container */}
      <div ref={mapRef} className="h-full w-full min-h-[300px]"></div>
    </div>
  );
};

export default MapComponent;