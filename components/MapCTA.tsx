"use client"

import Link from 'next/link';
import { Map } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/translations';
import { Button } from '@/components/ui/button';
import { useEffect, useRef, useState } from 'react';

const MapCTA = () => {
  const { language } = useLanguage();
  const t = translations[language];
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null); // Store Leaflet map instance
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined' || !mapRef.current) return;

    // Store the reference to prevent cleanup reference issues
    const mapContainer = mapRef.current;

    // Load Leaflet only on client side
    const loadMap = async () => {
      try {
        // Set explicit dimensions on container to ensure it's visible
        if (mapContainer) {
          mapContainer.style.height = '100%';
          mapContainer.style.width = '100%';
        }

        // Check if Leaflet is already loaded
        if (window.L) {
          initializeMap();
          return;
        }

        // Load Leaflet CSS
        const linkEl = document.createElement('link');
        linkEl.rel = 'stylesheet';
        try {
          linkEl.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        } catch (e) {
          console.warn('Using local Leaflet CSS fallback');
          linkEl.href = '/vendor/leaflet/leaflet.css';
        }
        document.head.appendChild(linkEl);

        // Load Leaflet JS with retry mechanism
        let retries = 0;
        const maxRetries = 3;
        
        const loadScript = () => {
          return new Promise((resolve, reject) => {
            const scriptEl = document.createElement('script');
            try {
              scriptEl.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
            } catch (e) {
              console.warn('Using local Leaflet JS fallback');
              scriptEl.src = '/vendor/leaflet/leaflet.js';
            }
            scriptEl.onload = resolve;
            scriptEl.onerror = (e) => {
              if (retries < maxRetries) {
                retries++;
                console.warn(`Leaflet script load error, retrying (${retries}/${maxRetries})...`);
                setTimeout(loadScript, 1000);
              } else {
                reject(e);
              }
            };
            document.head.appendChild(scriptEl);
          });
        };

        await loadScript();
        initializeMap();
      } catch (error) {
        console.error('Error loading Leaflet:', error);
        setHasError(true);
      }
    };

    const initializeMap = () => {
      if (!window.L || !mapContainer) return;

      try {
        // Clean up any existing map instance
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }

        const L = window.L;

        // Initialize the map
        const map = L.map(mapContainer, {
          center: [-6.7923, 39.2083], // Dar es Salaam coordinates
          zoom: 12,
          scrollWheelZoom: false,
          dragging: false,
          tap: false,
          zoomControl: false,
          attributionControl: false,
          fadeAnimation: false,
          zoomAnimation: false,
          markerZoomAnimation: false
        });

        // Store the map instance for cleanup
        mapInstanceRef.current = map;

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
          subdomains: ['a', 'b', 'c'],
          detectRetina: true,
          tileSize: 256,
          minZoom: 3
        }).addTo(map);

        // Fix z-index issues - set all Leaflet controls to a lower z-index than navbar
        const fixZIndexStyles = document.createElement('style');
        fixZIndexStyles.innerHTML = `
          .leaflet-pane, .leaflet-control, .leaflet-top, .leaflet-bottom {
            z-index: 5 !important;
          }
        `;
        document.head.appendChild(fixZIndexStyles);

        // Add a marker for Dar es Salaam
        L.marker([-6.7923, 39.2083])
          .addTo(map)
          .bindPopup('Dar es Salaam, Tanzania');
          
        setIsMapLoaded(true);
      } catch (error) {
        console.error('Error initializing map:', error);
        setHasError(true);
      }
    };

    loadMap();

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <section className="py-20 bg-primary/5">
      <div className="container mx-auto px-6 md:px-12 lg:px-16">
        <div className="flex flex-col md:flex-row items-center justify-between gap-10 lg:gap-16">
          <div className="mb-8 md:mb-0 md:w-1/2 max-w-md">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-gray-900 dark:text-white mb-4">
              Explore Properties on the Map
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
              Find properties in your preferred location with our interactive map view. 
              Easily filter by price, amenities, and more.
            </p>
            <Button asChild size="lg" className="px-6">
              <Link href="/map-view" className="inline-flex items-center">
                <Map className="h-5 w-5 mr-2" />
                View Map
              </Link>
            </Button>
          </div>
          
          <div className="w-full md:w-1/2 h-72 md:h-96 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden shadow-md relative">
            {/* Map error state */}
            {hasError && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-300 dark:bg-gray-800 z-10 p-4">
                <div className="text-center">
                  <p className="text-red-500 font-medium mb-2">Map could not be loaded</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Don&apos;t worry, you can still explore properties on the full map page</p>
                </div>
              </div>
            )}
            
            {/* Map loading indicator */}
            {!isMapLoaded && !hasError && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-700 z-10">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            
            <div ref={mapRef} className="w-full h-full"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Add TypeScript interface for window with Leaflet
declare global {
  interface Window {
    L: any;
  }
}

export default MapCTA;