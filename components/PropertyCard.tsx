"use client"

import { useState, useCallback, memo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Bed, Bath, MapPin, Square, ArrowUpRight, Star, Check } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/translations';
import { Badge } from '@/components/ui/badge';

interface Property {
  _id: string;
  title: string;
  titleKey?: string;
  price: number;
  currency: string;
  period: string;
  periodKey?: string;
  bedrooms: number;
  bathrooms: number;
  location: string;
  locationKey?: string;
  distance: string;
  image: string;
  type: string;
  available: boolean;
  isNew?: boolean;
  isVerified?: boolean;
  amenities?: string[];
  size?: number;
}

interface PropertyCardProps {
  property: Property;
  featured?: boolean;
  preview?: boolean;
  isHighlighted?: boolean;
  onClick?: () => void;
}

function PropertyCard({ property, featured = false, preview = false, isHighlighted, onClick }: PropertyCardProps) {
  const { language } = useLanguage();
  const t = translations[language];
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Define all hooks unconditionally at the top level
  const formatPrice = useCallback((price: number) => {
    try {
      return new Intl.NumberFormat(language === 'en' ? 'en-US' : 'sw-TZ', {
        style: 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(price);
    } catch (error) {
      return (price || 0).toString();
    }
  }, [language]);

  const handleImageError = useCallback(() => {
    if (property?.image) {
      console.error(`Failed to load property image: ${property.image}`);
    }
    setImageError(true);
  }, [property?.image]);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  // Safety check - if property is undefined or null, render a fallback
  if (!property) {
    console.error('PropertyCard received undefined or null property');
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden w-full p-4 h-48 flex items-center justify-center">
        <p className="text-red-500">Error: Invalid property data</p>
      </div>
    );
  }

  // Generate a local placeholder image instead of using a data URL
  const placeholderImage = "/images/property-placeholder.jpg";

  const propertyTitle = t?.property?.items?.[property?.titleKey as keyof typeof t.property.items] || property?.title || property?.titleKey || 'Property';
  const propertyLocation = t?.property?.items?.[property?.locationKey as keyof typeof t.property.items] || property?.location || property?.locationKey || 'Location';
  const propertyType = t?.browse?.search?.propertyTypes?.[property?.type as keyof typeof t.browse.search.propertyTypes] || property?.type || 'Property';
  const propertyPeriod = t?.property?.periods?.[property?.periodKey as keyof typeof t.property.periods] || property?.period || 'month';

  const CardContent = () => (
    <div className="flex flex-col md:flex-row h-full">
      {/* Image Section */}
      <div className="relative w-full md:w-2/5 h-64 md:h-auto overflow-hidden">
        <Image
          src={!imageError ? property?.image || placeholderImage : placeholderImage}
          alt={propertyTitle}
          fill
          sizes="(max-width: 768px) 100vw, 40vw"
          className={`object-cover group-hover:scale-110 transition-transform duration-700 ${imageLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200`}
          onError={handleImageError}
          onLoad={handleImageLoad}
          loading={featured ? "eager" : "lazy"}
          quality={featured ? 85 : 75}
          placeholder="blur"
          blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
        />
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse" />
        )}
      </div>
      
      {/* Content Section */}
      <div className="flex-1 p-5 flex flex-col bg-white dark:bg-gray-800 md:p-6">
        <div className="flex flex-col space-y-3">
          {/* Property type badge */}
          <div>
            <Badge className="bg-black/70 text-white text-xs font-medium py-0.5 px-2">
              {propertyType}
            </Badge>
          </div>
          
          {/* Title & Location */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors duration-300">
              {propertyTitle}
            </h3>
            <div className="flex items-center text-gray-600 dark:text-gray-400">
              <MapPin className="w-4 h-4 min-w-4 mr-1.5" />
              <span className="text-sm truncate">{propertyLocation}</span>
            </div>
          </div>
          
          {/* Status badges row */}
          <div className="flex flex-wrap gap-1.5">
            {/* Availability badge */}
            {property?.available ? (
              <Badge className="bg-green-600/90 text-white text-xs font-semibold py-0.5 px-2">
                {t?.property?.available || 'Available'}
              </Badge>
            ) : (
              <Badge className="bg-red-600/90 text-white text-xs font-semibold py-0.5 px-2">
                {t?.property?.unavailable || 'Unavailable'}
              </Badge>
            )}
            
            {/* Featured badge */}
            {featured && (
              <Badge className="bg-purple-600/90 text-white text-xs font-medium py-0.5 px-2">
                <Star className="w-3 h-3 mr-1" />
                {t?.property?.featured || 'Featured'}
              </Badge>
            )}
            
            {/* New badge */}
            {property?.isNew && (
              <Badge className="bg-green-600/90 text-white text-xs font-medium py-0.5 px-2">
                {t?.property?.new || 'New'}
              </Badge>
            )}
            
            {/* Verified badge */}
            {property?.isVerified && (
              <Badge className="bg-blue-600/90 text-white text-xs font-medium py-0.5 px-2">
                <Check className="w-3 h-3 mr-1" />
                {t?.property?.verified || 'Verified'}
              </Badge>
            )}
          </div>
        </div>
        
        {/* Property Features */}
        <div className="flex flex-wrap gap-6 mt-4 mb-3">
          <div className="flex items-center">
            <Bed className="w-4 h-4 text-primary mr-2" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {property?.bedrooms || 0} {(property?.bedrooms || 0) === 1 ? 'Bedroom' : 'Bedrooms'}
            </span>
          </div>
          
          <div className="flex items-center">
            <Bath className="w-4 h-4 text-primary mr-2" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {property?.bathrooms || 0} {(property?.bathrooms || 0) === 1 ? 'Bathroom' : 'Bathrooms'}
            </span>
          </div>
          
          {property?.size && (
            <div className="flex items-center">
              <Square className="w-4 h-4 text-primary mr-2" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {property.size} m²
              </span>
            </div>
          )}
        </div>
        
        {/* Divider */}
        <div className="border-b border-gray-100 dark:border-gray-700 mb-3"></div>
        
        {/* Amenities & View details */}
        <div className="flex items-center justify-between mb-3">
          {/* Amenities */}
          {property?.amenities && property.amenities.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {property.amenities.slice(0, 3).map((amenity) => (
                <Badge
                  key={amenity}
                  variant="outline"
                  className="text-xs text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-700"
                >
                  {t?.property?.amenities?.[amenity as keyof typeof t.property.amenities] || amenity}
                </Badge>
              ))}
              {property.amenities.length > 3 && (
                <Badge 
                  variant="outline" 
                  className="text-xs text-primary"
                >
                  +{property.amenities.length - 3}
                </Badge>
              )}
            </div>
          ) : (
            <div className="text-sm text-gray-500">
              {property?.distance || ''} {t?.property?.distance || 'from center'}
            </div>
          )}
          
          {/* Arrow icon */}
          {!preview && (
            <div className="ml-2 p-2 rounded-full bg-gray-100 dark:bg-gray-700/50 group-hover:bg-primary/10 group-hover:dark:bg-primary/20 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300">
              <ArrowUpRight className="w-4 h-4 text-primary" />
            </div>
          )}
        </div>
        
        {/* Price section - moved to the bottom with full width */}
        <div className="mt-auto w-full">
          <div className="flex justify-center w-full bg-primary text-white py-2 rounded-md font-bold text-lg">
            {property?.currency || 'TZS'} {formatPrice(property?.price || 0)}
            <span className="text-xs font-normal ml-1">
              /{propertyPeriod}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  if (preview) {
    return (
      <div 
        className={`bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden w-full 
        ${featured ? 'ring-2 ring-primary ring-offset-2' : ''}`}
      >
        <CardContent />
      </div>
    );
  }

  return (
    <Link 
      href={`/properties/${property._id || 'invalid'}`}
      className={`group block bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden w-full
        hover:shadow-xl focus:shadow-xl transition-all duration-300 
        cursor-pointer transform hover:-translate-y-1 focus:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
        ${featured ? 'ring-2 ring-primary ring-offset-2' : ''}`}
    >
      <CardContent />
    </Link>
  );
}

// Use memo to prevent unnecessary rerenders
export default memo(PropertyCard);