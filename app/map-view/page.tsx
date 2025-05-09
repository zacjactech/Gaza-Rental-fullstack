"use client";

import { useState, useEffect, useRef, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/translations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Filter, MapPin, Search, X } from "lucide-react";
import PropertyCard from '@/components/PropertyCard';
import Footer from '@/components/Footer';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslations } from 'next-intl';
import { Property } from '@/lib/models/property';
import { handleError } from '@/lib/utils';
import { MAP_CONFIG, sanitizeCoordinates } from '@/lib/utils/map-utils';

// Add a component to display map loading status for debugging
const MapStatus = ({ status, error }: { status: string; error?: any }) => {
  return (
    <div className="absolute top-4 right-4 z-20 bg-white dark:bg-gray-800 rounded-md shadow-md p-2 text-sm">
      <p className="font-medium">Map Status: <span className={status === 'error' ? 'text-red-500' : 'text-green-500'}>{status}</span></p>
      {error && <p className="text-red-500 text-xs mt-1">{error.toString()}</p>}
    </div>
  );
};

// Dynamically import the MapComponent with no SSR
const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
        <p className="text-gray-600 dark:text-gray-300">Loading map...</p>
      </div>
    </div>
  ),
});

// Add an enhanced error boundary component
function ErrorBoundary({ children }: { children: React.ReactNode }) {
  const [hasError, setHasError] = useState(false);
  const [errorInfo, setErrorInfo] = useState<any>(null);

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.log("Catching error in ErrorBoundary:", event);
      setHasError(true);
      setErrorInfo({
        message: event.message,
        stack: event.error?.stack,
        source: event.filename
      });
    };
    
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800 p-6">
        <div className="text-red-500 mb-4 text-lg">Something went wrong loading the map</div>
        {process.env.NODE_ENV === 'development' && errorInfo && (
          <div className="mb-4 p-4 bg-gray-200 dark:bg-gray-700 rounded-md max-w-full overflow-auto">
            <p className="font-mono text-sm text-red-500">{errorInfo.message}</p>
            {errorInfo.stack && (
              <pre className="mt-2 font-mono text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {errorInfo.stack}
              </pre>
            )}
          </div>
        )}
        <Button 
          onClick={() => {
            setHasError(false);
            setErrorInfo(null);
            window.location.reload();
          }}
        >
          Reload page
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}

// Remove Google Maps implementation and use only Leaflet MapComponent

export default function MapViewPage() {
  const { language } = useLanguage();
  const t = translations[language];
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [mapStatus, setMapStatus] = useState<{ state: string; error?: any }>({ state: 'loading' });
  const [filters, setFilters] = useState({
    location: '',
    propertyType: 'all',
    priceRange: '',
    bedrooms: '',
    bathrooms: '',
    amenities: [] as string[],
  });
  
  // Add ref for the map container
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Add additional filter options
  const [activeFilters, setActiveFilters] = useState(0);
  const [showSearchPanel, setShowSearchPanel] = useState(true);
  const [priceRange, setPriceRange] = useState([0, 1000000]);
  const [sortBy, setSortBy] = useState("newest");

  // Price range formatting
  const formatPriceLabel = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`;
    }
    return value.toString();
  };

  // Helper to count active filters
  useEffect(() => {
    let count = 0;
    if (filters.location) count++;
    if (filters.propertyType && filters.propertyType !== 'all') count++;
    if (filters.bedrooms && filters.bedrooms !== 'any') count++;
    if (filters.bathrooms && filters.bathrooms !== 'any') count++;
    if (filters.amenities.length > 0) count += filters.amenities.length;
    setActiveFilters(count);
  }, [filters]);

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      location: '',
      propertyType: 'all',
      priceRange: '',
      bedrooms: 'any',
      bathrooms: 'any',
      amenities: [],
    });
    setPriceRange([0, 1000000]);
    setSortBy("newest");
  };

  // Toggle search panel visibility on mobile
  const toggleSearchPanel = () => {
    setShowSearchPanel(!showSearchPanel);
  };

  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await fetch('/api/properties');
        if (!response.ok) {
          throw new Error('Failed to fetch properties');
        }
        const data = await response.json();
        setProperties(data.properties);
      } catch (err) {
        setError(handleError(err));
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAmenityToggle = (amenityId: string) => {
    setFilters(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenityId)
        ? prev.amenities.filter(id => id !== amenityId)
        : [...prev.amenities, amenityId]
    }));
  };

  const handleMapLoaded = () => {
    setMapStatus({ state: 'loaded' });
  };

  const handleMapError = (error: any) => {
    console.error('Map error:', error);
    setMapStatus({ state: 'error', error });
  };
  
  // Apply filters to properties
  const filteredProperties = useMemo(() => {
    return properties.filter(property => {
      // Filter by location
      if (filters.location && !property.location.toLowerCase().includes(filters.location.toLowerCase())) {
        return false;
      }
      
      // Filter by property type
      if (filters.propertyType !== 'all' && property.type !== filters.propertyType) {
        return false;
      }
      
      // Filter by price range
      if (property.price < priceRange[0] || property.price > priceRange[1]) {
        return false;
      }
      
      // Filter by bedrooms
      if (filters.bedrooms && filters.bedrooms !== 'any') {
        const bedroomCount = parseInt(filters.bedrooms);
        if (property.bedrooms !== bedroomCount) {
          return false;
        }
      }
      
      // Filter by bathrooms
      if (filters.bathrooms && filters.bathrooms !== 'any') {
        const bathroomCount = parseInt(filters.bathrooms);
        if (property.bathrooms !== bathroomCount) {
          return false;
        }
      }
      
      // Filter by amenities
      if (filters.amenities.length > 0) {
        if (!property.amenities) return false;
        for (const amenityId of filters.amenities) {
          if (!property.amenities.includes(amenityId)) {
            return false;
          }
        }
      }
      
      return true;
    });
  }, [properties, filters, priceRange]);

  // Format properties for map display
  const mapProperties = useMemo(() => {
    if (!filteredProperties || filteredProperties.length === 0) {
      return [];
    }
    
    return filteredProperties.map(property => {
      // Safely extract property values with fallbacks
      if (!property) return null;
      
      // Ensure coordinates are valid
      const safeCoordinates = property.coordinates && 
        Array.isArray(property.coordinates) && 
        property.coordinates.length === 2 && 
        !isNaN(Number(property.coordinates[0])) && 
        !isNaN(Number(property.coordinates[1])) ? 
        property.coordinates : 
        [-6.776, 39.178]; // Default to Dar es Salaam center
      
      return {
        id: property._id || '',
        title: property.title || 'Unnamed Property',
        price: property.price || 0,
        currency: property.currency || 'TZS',
        bedrooms: property.bedrooms || 0,
        bathrooms: property.bathrooms || 0,
        location: property.location || '',
        distance: '',
        image: (property.images && property.images.length > 0) ? property.images[0] : '/images/placeholder.jpg',
        coordinates: safeCoordinates,
        type: property.type || 'apartment',
        available: property.isAvailable ?? true
      };
    }).filter(Boolean); // Remove any null entries
  }, [filteredProperties]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-red-500 text-center max-w-md">
          <h2 className="text-2xl font-bold mb-2">Error</h2>
          <p>{error}</p>
          <Button className="mt-4" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto py-6 px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">{t.mapView.title}</h1>
          <p className="text-gray-600 dark:text-gray-400">{t.mapView.subtitle}</p>
        </div>

        <div className="xl:hidden mb-4 flex justify-between items-center">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={toggleSearchPanel} 
          >
            <Filter className="h-4 w-4" />
            Filters
              {activeFilters > 0 && (
              <span className="ml-1 bg-primary text-white text-xs px-1.5 py-0.5 rounded-full">
                {activeFilters}
              </span>
            )}
                </Button>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="price_low">Price: Low to High</SelectItem>
              <SelectItem value="price_high">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

        <div className="flex flex-col xl:flex-row gap-6">
          {/* Filters panel - hidden on mobile until toggled */}
          <Sheet open={showSearchPanel} onOpenChange={setShowSearchPanel}>
            <SheetContent side="left" className="xl:hidden w-[300px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle className="flex justify-between items-center">
                  <span>Filters</span>
                  {activeFilters > 0 && (
                    <Button variant="ghost" size="sm" onClick={resetFilters}>Reset all</Button>
                  )}
                </SheetTitle>
              </SheetHeader>
              {/* Filter controls here - Same as desktop but in sidebar */}
              {/* ... */}
            </SheetContent>
          </Sheet>

          {/* Desktop filters panel */}
          <div className="hidden xl:block w-80 shrink-0 bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-lg">{t.mapView.filters}</h2>
              {activeFilters > 0 && (
                <Button variant="ghost" size="sm" onClick={resetFilters}>
                  {t.mapView.resetFilters}
                  </Button>
              )}
            </div>

            {/* Filter controls */}
            {/* ... */}
        </div>

          {/* Map and listing section */}
          <div className="flex-1">
          {/* Map container */}
            <div className="relative w-full h-[500px] rounded-lg overflow-hidden mb-6 bg-gray-100 dark:bg-gray-800">
              <ErrorBoundary>
                <MapComponent
                  properties={mapProperties}
                  center={MAP_CONFIG.DEFAULT_CENTER}
                  zoom={MAP_CONFIG.DEFAULT_ZOOM}
                  onPropertySelect={(property) => {
                    try {
                      if (!property || !property.id) {
                        console.warn('Invalid property selected in map', property);
                        return;
                      }
                      
                      // Convert property.id to string for consistent comparison
                      const propId = String(property.id);
                      const selectedProp = properties.find(p => p && p._id === propId);
                      
                      if (!selectedProp) {
                        console.warn(`Property with ID ${propId} not found in properties array`);
                      }
                      
                      setSelectedProperty(selectedProp || null);
                    } catch (error) {
                      console.error('Error selecting property from map:', error);
                    }
                  }}
                  onLoad={handleMapLoaded}
                  onError={handleMapError}
                />
              </ErrorBoundary>
              
              {/* Conditionally render status indicator for debugging */}
              {process.env.NODE_ENV === 'development' && (
                <MapStatus status={mapStatus.state} error={mapStatus.error} />
              )}
            </div>

            {/* Property listing below map */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProperties.length === 0 ? (
                <div className="col-span-full py-8 text-center bg-white dark:bg-gray-800 rounded-lg shadow-sm border">
                  <p className="text-gray-600 dark:text-gray-400 mb-2">{t.mapView.noResults}</p>
                  <Button variant="outline" onClick={resetFilters}>
                    {t.mapView.clearFilters}
                  </Button>
              </div>
              ) : (
                filteredProperties
                  .filter(property => property && property._id) // Ensure we only render valid properties
                  .map((property) => (
                  <PropertyCard 
                    key={property._id}
                    property={property}
                    isHighlighted={selectedProperty?._id === property._id}
                    onClick={() => setSelectedProperty(property)}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}