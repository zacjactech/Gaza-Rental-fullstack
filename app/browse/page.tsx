"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/translations';
import PropertyCard from '@/components/PropertyCard';
import Footer from '@/components/Footer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { 
  Search, 
  MapPin, 
  Home, 
  Filter, 
  ChevronDown, 
  ChevronUp, 
  Bed, 
  Bath, 
  Wifi, 
  Car, 
  Dog, 
  Shield, 
  CheckCircle,
  ArrowUpDown
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import { propertyService, Property } from '@/lib/api';
import { handleError } from '@/lib/utils';

export default function BrowsePage() {
  const searchParams = useSearchParams();
  const initialLocation = searchParams.get('location') || '';
  const initialType = searchParams.get('type') || 'all';
  
  const { language } = useLanguage();
  const t = translations[language];

  // State for UI
  const [isFiltersVisible, setIsFiltersVisible] = useState(false);
  const [sortBy, setSortBy] = useState<string>('newest');
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // State for filters
  const [filters, setFilters] = useState({
    location: initialLocation,
    propertyType: initialType,
    bedrooms: 'any',
    bathrooms: 'any',
    minPrice: 0,
    maxPrice: 1000000,
    amenities: [] as string[]
  });

  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      
      try {
        // Build query parameters based on filters
        const params = new URLSearchParams();
        
        // Add pagination
        params.append('page', currentPage.toString());
        params.append('limit', '12'); // Show 12 properties per page
        
        // Add filters if they are set
        if (filters.propertyType && filters.propertyType !== 'all') {
          params.append('type', filters.propertyType);
        }
        
        if (filters.minPrice > 0) {
          params.append('minPrice', filters.minPrice.toString());
        }
        
        if (filters.maxPrice < 1000000) {
          params.append('maxPrice', filters.maxPrice.toString());
        }
        
        if (filters.bedrooms && filters.bedrooms !== 'any') {
          params.append('bedrooms', filters.bedrooms);
        }
        
        if (filters.bathrooms && filters.bathrooms !== 'any') {
          params.append('bathrooms', filters.bathrooms);
        }
        
        if (filters.location && filters.location.trim() !== '') {
          params.append('location', filters.location);
        }
        
        // Add amenities if any are selected
        if (filters.amenities.length > 0) {
          params.append('amenities', filters.amenities.join(','));
        }
        
        // Add sorting parameter
        params.append('sort', sortBy);
        
        console.log('Fetching properties with params:', params.toString());
        const response = await fetch(`/api/properties?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch properties: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Fetched properties data:', data);
        
        // Handle different API response formats
        if (Array.isArray(data)) {
          setProperties(data);
          setTotalPages(1);
        } else if (data.properties && Array.isArray(data.properties)) {
          setProperties(data.properties);
          
          // Set pagination data if it exists
          if (data.pagination) {
            setTotalPages(data.pagination.totalPages || 1);
          } else {
            // Calculate pages based on array length if pagination info isn't provided
            setTotalPages(Math.ceil(data.properties.length / 12) || 1);
          }
        } else {
          console.error('Unexpected API response format:', data);
          setProperties([]);
          setTotalPages(1);
          setError('Received invalid data from the server');
        }
      } catch (err) {
        console.error('Error fetching properties:', err);
        setError(err instanceof Error ? err.message : 'An error occurred while fetching properties');
        setProperties([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProperties();
  }, [currentPage, filters.propertyType, filters.minPrice, filters.maxPrice, filters.bedrooms, filters.bathrooms, filters.location, filters.amenities, sortBy]);

  // Sort properties based on selected sort option (only if needed for client-side sorting)
  const sortedProperties = [...properties].sort((a, b) => {
    // Only sort client-side if server sorting isn't working for some reason
    if (sortBy === 'priceAsc') {
      return a.price - b.price;
    } else if (sortBy === 'priceDesc') {
      return b.price - a.price;
    } else if (sortBy === 'newest' && a.createdAt && b.createdAt) {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    return 0;
  });

  // Handle filter changes
  const handleFilterChange = (name: string, value: any) => {
    setFilters({
      ...filters,
      [name]: value
    });
  };

  // Handle amenity toggle
  const toggleAmenity = (amenity: string) => {
    if (filters.amenities.includes(amenity)) {
      setFilters({
        ...filters,
        amenities: filters.amenities.filter(a => a !== amenity)
      });
    } else {
      setFilters({
        ...filters,
        amenities: [...filters.amenities, amenity]
      });
    }
  };

  // Handle search submission
  const handleSearch = async () => {
    try {
      setLoading(true);
      const data = await propertyService.search(filters);
      setProperties(data);
      setError(null);
    } catch (err) {
      setError(handleError(err));
    } finally {
      setLoading(false);
    }
  };

  // Handle reset filters
  const resetFilters = () => {
    setFilters({
      location: '',
      propertyType: 'all',
      bedrooms: 'any',
      bathrooms: 'any',
      minPrice: 0,
      maxPrice: 1000000,
      amenities: []
    });
  };

  // Function to handle page changes
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main className="flex flex-col min-h-screen">
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col space-y-8">
          {/* Page Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {t?.browse?.title}
              </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {t?.browse?.subtitle}
            </p>
            </div>
            
          {/* Search Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 md:p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Location */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  className="pl-10"
                  placeholder={t?.browse?.search?.locationPlaceholder}
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                />
              </div>
              
              {/* Property Type */}
              <div>
              <Select
                value={filters.propertyType}
                onValueChange={(value) => handleFilterChange('propertyType', value)}
              >
                <SelectTrigger>
                    <div className="flex items-center">
                      <Home className="mr-2 h-4 w-4" />
                      <SelectValue placeholder={t?.browse?.search?.propertyType} />
                    </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t?.browse?.search?.propertyTypes?.all}</SelectItem>
                    <SelectItem value="apartment">{t?.browse?.search?.propertyTypes?.apartment}</SelectItem>
                    <SelectItem value="house">{t?.browse?.search?.propertyTypes?.house}</SelectItem>
                    <SelectItem value="villa">{t?.browse?.search?.propertyTypes?.villa}</SelectItem>
                    <SelectItem value="studio">{t?.browse?.search?.propertyTypes?.studio}</SelectItem>
                </SelectContent>
              </Select>
              </div>
              
              {/* Search Button */}
              <Button className="w-full" onClick={handleSearch}>
                <Search className="h-4 w-4 mr-2" />
                  {t?.browse?.search?.searchButton}
                </Button>
              </div>

            {/* Advanced Filters Toggle */}
            <div className="mt-4">
              <Button 
                variant="ghost" 
                className="text-sm p-0 h-auto" 
                onClick={() => setIsFiltersVisible(!isFiltersVisible)}
              >
                <Filter className="h-4 w-4 mr-1" />
                {isFiltersVisible ? t?.browse?.search?.hideFilters : t?.browse?.search?.moreFilters}
                {isFiltersVisible ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />}
              </Button>
            </div>

            {/* Advanced Filters */}
            {isFiltersVisible && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Bedrooms */}
                  <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Bed className="h-4 w-4 inline mr-1" />
                      {t?.browse?.search?.filters?.bedrooms}
                  </label>
                    <Select
                      value={filters.bedrooms}
                      onValueChange={(value) => handleFilterChange('bedrooms', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Any" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any</SelectItem>
                      <SelectItem value="1">1+</SelectItem>
                      <SelectItem value="2">2+</SelectItem>
                      <SelectItem value="3">3+</SelectItem>
                      <SelectItem value="4+">4+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                {/* Bathrooms */}
                  <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Bath className="h-4 w-4 inline mr-1" />
                      {t?.browse?.search?.filters?.bathrooms}
                  </label>
                    <Select
                      value={filters.bathrooms}
                      onValueChange={(value) => handleFilterChange('bathrooms', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Any" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any</SelectItem>
                      <SelectItem value="1">1+</SelectItem>
                      <SelectItem value="2">2+</SelectItem>
                      <SelectItem value="3+">3+</SelectItem>
                      </SelectContent>
                    </Select>
                </div>

                {/* Price Range */}
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t?.browse?.search?.filters?.priceRange}: {filters.minPrice.toLocaleString()} - {filters.maxPrice.toLocaleString()} TZS
                  </label>
                    <Slider
                      defaultValue={[filters.minPrice, filters.maxPrice]}
                      max={1000000}
                    step={50000}
                    value={[filters.minPrice, filters.maxPrice]}
                      onValueChange={(value) => {
                        handleFilterChange('minPrice', value[0]);
                        handleFilterChange('maxPrice', value[1]);
                      }}
                    className="py-2"
                  />
                </div>

                {/* Amenities */}
                <div className="col-span-1 md:col-span-2 lg:col-span-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t?.browse?.search?.filters?.amenities}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <Badge 
                      variant={filters.amenities.includes('wifi') ? 'default' : 'outline'} 
                      className="cursor-pointer"
                      onClick={() => toggleAmenity('wifi')}
                    >
                      <Wifi className="h-3 w-3 mr-1" />
                      {t?.property?.amenities?.wifi || 'Wi-Fi'}
                    </Badge>
                    <Badge 
                      variant={filters.amenities.includes('parking') ? 'default' : 'outline'} 
                      className="cursor-pointer"
                      onClick={() => toggleAmenity('parking')}
                    >
                      <Car className="h-3 w-3 mr-1" />
                      {t?.property?.amenities?.parking || 'Parking'}
                    </Badge>
                    <Badge 
                      variant={filters.amenities.includes('pets') ? 'default' : 'outline'} 
                      className="cursor-pointer"
                      onClick={() => toggleAmenity('pets')}
                    >
                      <Dog className="h-3 w-3 mr-1" />
                      {t?.property?.amenities?.pets || 'Pets Allowed'}
                    </Badge>
                    <Badge 
                      variant={filters.amenities.includes('security') ? 'default' : 'outline'} 
                      className="cursor-pointer"
                      onClick={() => toggleAmenity('security')}
                    >
                      <Shield className="h-3 w-3 mr-1" />
                      {t?.property?.amenities?.security || 'Security'}
                    </Badge>
                    <Badge 
                      variant={filters.amenities.includes('furnished') ? 'default' : 'outline'} 
                      className="cursor-pointer"
                      onClick={() => toggleAmenity('furnished')}
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {t?.property?.amenities?.furnished || 'Furnished'}
                    </Badge>
                  </div>
                </div>

                {/* Filter Actions */}
                <div className="col-span-1 md:col-span-2 lg:col-span-4 flex justify-between">
                  <Button variant="outline" onClick={resetFilters}>
                  {t?.browse?.search?.filters?.clear}
                </Button>
                  <Button onClick={handleSearch}>
                    {t?.browse?.search?.filters?.apply}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Results Section */}
          <div>
            {/* Results Header */}
            <div className="flex flex-wrap items-center justify-between mb-6">
              <div className="mb-4 md:mb-0">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t?.browse?.results?.showing} <span className="text-primary">{sortedProperties.length}</span> {t?.browse?.results?.properties}
                </h2>
              </div>

              {/* Sort Options */}
              <div className="flex items-center">
                <span className="mr-2 text-sm text-gray-600 dark:text-gray-400">
                  {t?.browse?.results?.sortBy}
                </span>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">
                      <div className="flex items-center">
                        <ArrowUpDown className="mr-2 h-4 w-4" />
                        {t?.browse?.results?.sortOptions?.newest}
                      </div>
                    </SelectItem>
                    <SelectItem value="priceAsc">
                      <div className="flex items-center">
                        <ArrowUpDown className="mr-2 h-4 w-4" />
                        {t?.browse?.results?.sortOptions?.priceAsc}
                      </div>
                    </SelectItem>
                    <SelectItem value="priceDesc">
                      <div className="flex items-center">
                        <ArrowUpDown className="mr-2 h-4 w-4" />
                        {t?.browse?.results?.sortOptions?.priceDesc}
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
        </div>
      </div>

            {/* Properties display section */}
            <div className="mt-6">
              {loading ? (
                // Loading state
                <div className="flex justify-center items-center min-h-[400px]">
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : error ? (
                // Error state
                <div className="text-center py-10">
                  <h3 className="text-xl font-semibold text-red-500 mb-2">Error</h3>
                  <p className="text-gray-600 dark:text-gray-400">{error}</p>
                  <Button className="mt-4" onClick={() => window.location.reload()}>
                    Try Again
                  </Button>
                </div>
              ) : properties.length === 0 ? (
                // No results state
                <div className="text-center py-10">
                  <h3 className="text-xl font-semibold mb-2">No properties found</h3>
                  <p className="text-gray-600 dark:text-gray-400">Try adjusting your filters to see more results.</p>
                </div>
              ) : (
                // Properties grid
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {properties.map((property) => (
                      <PropertyCard key={property._id} property={property} />
                    ))}
                  </div>
                  
                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center mt-8">
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          Previous
                        </Button>
                        
                        {/* Page numbers */}
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            onClick={() => handlePageChange(page)}
                          >
                            {page}
                          </Button>
                        ))}
                        
                        <Button
                          variant="outline"
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}