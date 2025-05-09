"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  MapPin, 
  Bed, 
  Bath, 
  Home, 
  Phone, 
  Mail, 
  Calendar as CalendarIcon, 
  CreditCard, 
  Star, 
  Heart, 
  Share2,
  ArrowLeft,
  Square,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Footer from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/translations';
import { useRouter } from 'next/navigation';
import { toast } from '@/components/ui/use-toast';
import { propertyService, Property as PropertyType } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import MapComponent from '@/components/MapComponent';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Update the Property interface to use landlordId instead of landlord
interface Property extends PropertyType {
  landlordId?: {
    name: string;
    email: string;
    phone: string;
    avatar?: string;
    verified?: boolean;
  };
  reviews?: Array<{
    user: string;
    rating: number;
    comment: string;
    date: string;
  }>;
}

export default function PropertyDetail({ params }: { params: { id: string } }) {
  // Use the ID directly in the component but create a state to store it
  // This avoids directly destructuring params which could be a promise
  const [propertyId, setPropertyId] = useState<string>('');
  
  const { language } = useLanguage();
  const t = translations[language];
  const router = useRouter();
  const { toast } = useToast();
  
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mainImage, setMainImage] = useState('');
  const [showContact, setShowContact] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [bookingDate, setBookingDate] = useState<Date | undefined>(undefined);
  const [bookingDuration, setBookingDuration] = useState('12');
  const [paymentMethod, setPaymentMethod] = useState('mpesa');
  const [message, setMessage] = useState('');
  
  // Store the ID in state when the component mounts
  useEffect(() => {
    if (params && params.id) {
      setPropertyId(params.id);
    }
  }, [params]);
  
  // Fetch property data when component mounts or id changes
  const fetchProperty = useCallback(async () => {
    if (!propertyId) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/properties/${propertyId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch property');
      }
      
      const data = await response.json();
      
      // Validate the essential property data
      if (!data || !data._id || !data.title || !data.price) {
        throw new Error('Invalid property data received');
      }
      
      // Convert fields to appropriate types if needed
      const processedData = {
        ...data,
        price: typeof data.price === 'string' ? parseFloat(data.price) : data.price,
        bedrooms: typeof data.bedrooms === 'string' ? parseInt(data.bedrooms, 10) : data.bedrooms,
        bathrooms: typeof data.bathrooms === 'string' ? parseInt(data.bathrooms, 10) : data.bathrooms,
        size: data.size && typeof data.size === 'string' ? parseInt(data.size, 10) : data.size,
        amenities: Array.isArray(data.amenities) ? data.amenities : [],
        coordinates: Array.isArray(data.coordinates) ? data.coordinates : [-6.8, 39.2], // Default to Dar es Salaam if missing
        // Ensure there's always an image
        image: data.image || '/images/property-placeholder.jpg',
        // Ensure images is always an array
        images: Array.isArray(data.images) && data.images.length > 0 
          ? data.images 
          : data.image 
            ? [data.image] 
            : ['/images/property-placeholder.jpg']
      };
      
      setProperty(processedData);
      setMainImage(processedData.image);
      setError(null);
      
      console.log('Loaded property:', processedData);
    } catch (error) {
      console.error('Error fetching property:', error);
      setError(error instanceof Error ? error.message : 'Failed to load property');
    } finally {
      setLoading(false);
    }
  }, [propertyId]);
  
  // Check if this property is in favorites
  const checkFavorite = useCallback(async () => {
    if (!propertyId) return;
    
    try {
      // First check if user is logged in by trying to get current user
      const userResponse = await fetch('/api/auth/me');
      if (!userResponse.ok) {
        // User not logged in, don't check favorites
        setIsSaved(false);
        return;
      }
      
      const response = await fetch(`/api/favorites?propertyId=${propertyId}`);
      if (response.ok) {
        const data = await response.json();
        setIsSaved(!!data.isFavorite); // Ensure it's a boolean
      } else {
        setIsSaved(false);
      }
    } catch (error) {
      console.error('Error checking favorite status:', error);
      setIsSaved(false);
    }
  }, [propertyId]);
  
  useEffect(() => {
    if (propertyId) {
      fetchProperty();
      checkFavorite();
    }
    
    // Cleanup function
    return () => {
      setProperty(null);
      setLoading(true);
      setError(null);
    };
  }, [propertyId, fetchProperty, checkFavorite]);
  
  // Helper function to safely get translation strings
  const getTranslation = (path: string, fallback: string): string => {
    const parts = path.split('.');
    let result: any = t;
    
    for (const part of parts) {
      if (result && typeof result === 'object' && part in result) {
        result = result[part];
      } else {
        return fallback;
      }
    }
    
    return typeof result === 'string' ? result : fallback;
  };

  const handleSaveProperty = async () => {
    try {
      if (isSaved) {
        // Remove from favorites
        await fetch(`/api/favorites?propertyId=${propertyId}`, {
          method: 'DELETE',
        });
      } else {
        // Add to favorites
        await fetch('/api/favorites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ propertyId: propertyId }),
        });
      }
      
      setIsSaved(!isSaved);
      // Show toast notification
      const action = isSaved ? 'removed from' : 'added to';
      toast({
        title: "Success",
        description: `Property ${action} your saved list.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Please log in to save properties",
        variant: "destructive",
      });
      router.push('/login');
    }
  };
  
  const handleShareProperty = () => {
    if (navigator.share) {
      navigator.share({
        title: property?.title || 'Property listing',
        text: `Check out this property: ${property?.title}`,
        url: window.location.href,
      }).catch((error) => {
        console.error('Error sharing:', error);
        copyToClipboard();
      });
    } else {
      copyToClipboard();
    }
  };
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      toast({
        title: "Link copied",
        description: "Property link copied to clipboard",
      });
    });
  };
  
  const handleBookProperty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingDate) {
      toast({
        title: "Missing information",
        description: "Please select a move-in date",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Booking request sent",
      description: `Your booking request for ${bookingDate.toLocaleDateString()} has been submitted.`,
    });
  };
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      toast({
        title: "Missing information",
        description: "Please enter a message",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Message sent",
      description: "Your message has been sent to the landlord.",
    });
    setMessage('');
  };
  
  const renderStars = (rating: number) => {
    return Array(5).fill(0).map((_, index) => (
      <Star 
        key={index}
        className={`h-4 w-4 ${index < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };
  
  // Loading state
  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">
          {getTranslation('property.loading', 'Loading property details...')}
        </p>
      </div>
    );
  }
  
  // Error state
  if (error || !property) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg max-w-md text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-4">
            {getTranslation('common.error', 'Error')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error || getTranslation('property.notFound', 'Property not found')}
          </p>
          <Button onClick={() => router.push('/browse')}>
            {getTranslation('common.backToBrowse', 'Back to Browse')}
          </Button>
        </div>
      </div>
    );
  }

  // List of amenities with proper translation keys
  const propertyAmenities = property.amenities || [];

  // Reduce the number of tags displayed to only 2
  const renderAmenityTags = (amenities: string[]) => {
    // Only show up to 2 amenities as requested
    const displayedAmenities = amenities.slice(0, 2);
    const remainingCount = amenities.length - 2;
    
    return (
      <>
        {displayedAmenities.map((amenity) => (
          <Badge key={amenity} variant="outline" className="text-xs bg-primary/10 border-0 text-primary">
            {getTranslation(`property.amenities.${amenity}`, amenity)}
          </Badge>
        ))}
        {remainingCount > 0 && (
          <Badge variant="outline" className="text-xs bg-gray-100 border-0 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
            +{remainingCount} more
          </Badge>
        )}
      </>
    );
  };

  return (
    <main className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center">
            <Link href="/browse" className="flex items-center text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">
              <ArrowLeft className="h-4 w-4 mr-1" />
              <span>{getTranslation('common.backToListings', 'Back to listings')}</span>
            </Link>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row lg:space-x-8">
          {/* Left column - Property details */}
          <div className="w-full lg:w-2/3">
            <div className="mb-6">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {property.title}
              </h1>
              <div className="flex items-start mb-2">
                <MapPin className="h-5 w-5 text-primary mr-1 flex-shrink-0 mt-0.5" />
                <span className="text-gray-600 dark:text-gray-400">
                  {property.location}
                </span>
              </div>
              
              <div className="flex flex-wrap gap-2 my-3">
                {property.type && (
                  <Badge variant="outline" className="text-xs bg-primary/10 border-0 text-primary">
                    {getTranslation(`browse.search.propertyTypes.${property.type}`, property.type)}
                  </Badge>
                )}
                
                {/* Amenity tags displayed at the top */}
                {renderAmenityTags(propertyAmenities)}
                
                {property.isVerified && (
                  <Badge variant="outline" className="text-xs bg-blue-600/10 border-0 text-blue-600">
                    <Star className="w-3 h-3 mr-1 fill-blue-600" />
                    {getTranslation('property.verified', 'Verified')}
                  </Badge>
                )}
                
                {property.isNew && (
                  <Badge variant="outline" className="text-xs bg-green-600/10 border-0 text-green-600">
                    {getTranslation('property.new', 'New')}
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center space-x-4 mt-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className={`flex items-center gap-1 ${isSaved ? 'bg-primary/10' : ''}`}
                  onClick={handleSaveProperty}
                >
                  <Heart className={`h-4 w-4 ${isSaved ? 'fill-primary text-primary' : ''}`} />
                  {isSaved ? (getTranslation('property.saved', 'Saved')) : (getTranslation('property.save', 'Save'))}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-1"
                  onClick={handleShareProperty}
                >
                  <Share2 className="h-4 w-4" />
                  {getTranslation('property.share', 'Share')}
                </Button>
              </div>
            </div>
            
            {/* Image gallery */}
            <div className="mb-8">
              <div className="relative h-72 md:h-96 w-full mb-4 overflow-hidden rounded-lg">
                {/* Overlay for tags on the image */}
                <div className="absolute top-4 left-4 right-4 z-10 flex flex-wrap gap-2">
                  {/* Priority tags directly on the image */}
                  {property.type && (
                    <Badge variant="outline" className="text-xs bg-white/90 border-0 text-primary shadow-sm backdrop-blur-sm">
                      {getTranslation(`browse.search.propertyTypes.${property.type}`, property.type)}
                    </Badge>
                  )}
                  
                  {/* Availability badge - clearly visible on image */}
                  {property.available ? (
                    <Badge className="text-xs bg-green-600/90 text-white font-semibold py-0.5 px-2 backdrop-blur-sm">
                      {getTranslation('property.available', 'Available')}
                    </Badge>
                  ) : (
                    <Badge className="text-xs bg-red-600/90 text-white font-semibold py-0.5 px-2 backdrop-blur-sm">
                      {getTranslation('property.unavailable', 'Unavailable')}
                    </Badge>
                  )}
                  
                  {property.isVerified && (
                    <Badge variant="outline" className="text-xs bg-white/90 border-0 text-blue-600 shadow-sm backdrop-blur-sm">
                      <Star className="w-3 h-3 mr-1 fill-blue-600" />
                      {getTranslation('property.verified', 'Verified')}
                    </Badge>
                  )}
                </div>
                
                <Image
                  src={mainImage}
                  alt={property.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 50vw"
                  style={{ objectFit: 'cover' }}
                  className="rounded-lg"
                  priority
                />
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[property.image, ...(property.images || [])].filter(Boolean).slice(0, 4).map((image, index) => (
                  <div 
                    key={index}
                    className={`relative h-20 md:h-24 cursor-pointer rounded-md overflow-hidden ${image === mainImage ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => setMainImage(image)}
                  >
                    <Image
                      src={image}
                      alt={`${property.title} - image ${index + 1}`}
                      fill
                      sizes="(max-width: 768px) 25vw, 16vw"
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                ))}
              </div>
            </div>
            
            {/* Property details */}
            <div className="mb-8">
              <div className="flex flex-wrap gap-6 mb-6 border-b border-gray-200 dark:border-gray-800 pb-6">
                <div className="flex items-center">
                  <Bed className="h-5 w-5 text-gray-600 dark:text-gray-400 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-500">{getTranslation('property.bedrooms', 'Bedrooms')}</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{property.bedrooms}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Bath className="h-5 w-5 text-gray-600 dark:text-gray-400 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-500">{getTranslation('property.bathrooms', 'Bathrooms')}</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{property.bathrooms}</p>
                  </div>
                </div>
                {property.size && (
                  <div className="flex items-center">
                    <Square className="h-5 w-5 text-gray-600 dark:text-gray-400 mr-2" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-500">{getTranslation('property.area', 'Area')}</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{property.size} {getTranslation('property.sqm', 'sqm')}</p>
                    </div>
                  </div>
                )}
              </div>
              
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {getTranslation('property.aboutProperty', 'About This Property')}
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                {property.description || getTranslation('property.noDescription', 'No description available for this property.')}
              </p>
              
              {/* Amenities section */}
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                {getTranslation('property.amenities', 'Amenities')}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-y-2 mb-6">
                {propertyAmenities.map((amenity) => (
                  <div key={amenity} className="flex items-center">
                    <div className="h-2 w-2 mr-2 rounded-full bg-primary" />
                    <span className="text-gray-700 dark:text-gray-300 text-sm">
                      {getTranslation(`property.amenities.${amenity}`, amenity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Map location */}
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                {getTranslation('property.location', 'Location')}
              </h3>
              <div className="h-64 w-full mb-6 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                <MapComponent
                  center={[property.latitude || -6.776012, property.longitude || 39.178326]}
                  zoom={14}
                  markers={[{
                    position: [property.latitude || -6.776012, property.longitude || 39.178326],
                    title: property.title
                  }]}
                  showSearch={false}
                />
              </div>
            </div>
            
            {/* Reviews section */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {getTranslation('property.reviews', 'Reviews')}
              </h3>
              {property.reviews && property.reviews.length > 0 ? (
                <div className="space-y-4">
                  {property.reviews.map((review, index) => (
                    <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex justify-between mb-2">
                        <div className="font-medium text-gray-900 dark:text-white">{review.user}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{review.date}</div>
                      </div>
                      <div className="flex mb-2">
                        {renderStars(review.rating)}
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 text-sm">{review.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">
                  {getTranslation('property.noReviews', 'No reviews yet for this property.')}
                </p>
              )}
            </div>
          </div>
          
          {/* Right column - Price, booking, contact */}
          <div className="w-full lg:w-1/3 mt-6 lg:mt-0">
            {/* Price card */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-6 sticky top-20">
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {property.currency} {property.price.toLocaleString()}
                  <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                    /{getTranslation(`property.periods.${property.period}`, property.period)}
                  </span>
                </h2>
                {property.available ? (
                  <Badge className="mt-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 font-medium py-1">
                    {getTranslation('property.available', 'Available Now')}
                  </Badge>
                ) : (
                  <Badge className="mt-2 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100 font-medium py-1">
                    {getTranslation('property.unavailable', 'Unavailable')}
                  </Badge>
                )}
              </div>

              {/* Booking Form */}
              {property.available && (
                <div className="mt-4">
                  <form onSubmit={handleBookProperty}>
                    <div className="space-y-4">
                      {/* Move-in Date */}
                      <div>
                        <Label htmlFor="move-in-date">
                          {getTranslation('property.booking.moveInDate', 'Move-in Date')}
                        </Label>
                        <div className="mt-1">
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-full justify-start text-left font-normal"
                                disabled={!property.available}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {bookingDate ? format(bookingDate, 'PPP') : getTranslation('property.booking.selectDate', 'Select a date')}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={bookingDate}
                                onSelect={setBookingDate}
                                initialFocus
                                disabled={(date) => date < new Date()}
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>

                      {/* Rental Duration */}
                      <div>
                        <Label htmlFor="duration">
                          {getTranslation('property.booking.duration', 'Rental Duration')}
                        </Label>
                        <Select
                          value={bookingDuration}
                          onValueChange={setBookingDuration}
                          disabled={!property.available}
                        >
                          <SelectTrigger className="w-full mt-1">
                            <SelectValue placeholder={getTranslation('property.booking.selectDuration', 'Select duration')} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="3">3 {getTranslation('property.booking.months', 'months')}</SelectItem>
                            <SelectItem value="6">6 {getTranslation('property.booking.months', 'months')}</SelectItem>
                            <SelectItem value="12">12 {getTranslation('property.booking.months', 'months')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Payment Method */}
                      <div>
                        <Label htmlFor="payment-method">
                          {getTranslation('property.booking.paymentMethod', 'Payment Method')}
                        </Label>
                        <Select
                          value={paymentMethod}
                          onValueChange={setPaymentMethod}
                          disabled={!property.available}
                        >
                          <SelectTrigger className="w-full mt-1">
                            <SelectValue placeholder={getTranslation('property.booking.selectPayment', 'Select payment method')} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="mpesa">M-Pesa</SelectItem>
                            <SelectItem value="bank">Bank Transfer</SelectItem>
                            <SelectItem value="card">Credit Card</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Estimated Total */}
                      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex justify-between">
                          <span className="text-gray-700 dark:text-gray-300">
                            {getTranslation('property.booking.estimatedTotal', 'Estimated Total')}
                          </span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {property.currency} {(property.price * parseInt(bookingDuration || '12')).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {getTranslation('property.booking.disclaimer', 'Additional fees may apply')}
                        </p>
                      </div>

                      {/* Book Now Button */}
                      <Button 
                        type="submit" 
                        className="w-full bg-primary text-white hover:bg-primary/80 mt-4"
                        disabled={!property.available || !bookingDate}
                      >
                        <CreditCard className="mr-2 h-4 w-4" />
                        {getTranslation('property.booking.bookNow', 'Book Now')}
                      </Button>
                    </div>
                  </form>
                </div>
              )}
              
              {/* Landlord Contact */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {getTranslation('property.landlord', 'Contact Landlord')}
                </h3>
                
                {/* Landlord Details */}
                {property.landlordId && (
                  <div className="flex items-start mb-4">
                    <div className="relative h-12 w-12 rounded-full overflow-hidden mr-3 bg-gray-200 dark:bg-gray-700 flex-shrink-0">
                      {property.landlordId.avatar ? (
                        <Image
                          src={property.landlordId.avatar}
                          alt={property.landlordId.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-primary/10 text-primary">
                          {property.landlordId.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white flex items-center">
                        {property.landlordId.name}
                        {property.landlordId.verified && (
                          <span className="ml-1 text-blue-500">
                            <Check className="h-4 w-4" />
                          </span>
                        )}
                      </h4>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {showContact ? (
                          <>
                            {property.landlordId.phone && (
                              <div className="flex items-center mt-1">
                                <Phone className="h-4 w-4 mr-1" />
                                <a href={`tel:${property.landlordId.phone}`} className="hover:text-primary">
                                  {property.landlordId.phone}
                                </a>
                              </div>
                            )}
                            {property.landlordId.email && (
                              <div className="flex items-center mt-1">
                                <Mail className="h-4 w-4 mr-1" />
                                <a href={`mailto:${property.landlordId.email}`} className="hover:text-primary">
                                  {property.landlordId.email}
                                </a>
                              </div>
                            )}
                          </>
                        ) : (
                          <Button 
                            variant="link" 
                            className="p-0 h-auto text-primary" 
                            onClick={() => setShowContact(true)}
                          >
                            {getTranslation('property.showContact', 'Show contact details')}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Message Form */}
                <form onSubmit={handleSendMessage}>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="message">
                        {getTranslation('property.message.label', 'Message to landlord')}
                      </Label>
                      <Textarea
                        id="message"
                        placeholder={getTranslation('property.message.placeholder', 'Hi, I am interested in this property...')}
                        className="mt-1"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={4}
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-transparent border-primary text-primary hover:bg-primary/10"
                    >
                      {getTranslation('property.message.send', 'Send Message')}
                    </Button>
                  </div>
                </form>
              </div>
              
              {/* Action Buttons */}
              <div className="mt-6 flex space-x-2">
                <Button
                  variant="outline"
                  className="w-1/2"
                  onClick={handleSaveProperty}
                >
                  <Heart className={`mr-2 h-4 w-4 ${isSaved ? 'fill-red-500 text-red-500' : ''}`} />
                  {isSaved 
                    ? getTranslation('property.saved', 'Saved') 
                    : getTranslation('property.save', 'Save')}
                </Button>
                <Button
                  variant="outline"
                  className="w-1/2"
                  onClick={handleShareProperty}
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  {getTranslation('property.share', 'Share')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </main>
  );
}