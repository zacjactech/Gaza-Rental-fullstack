"use client"

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Hero from '@/components/Hero';
import PropertyCard from '@/components/PropertyCard';
import MapCTA from '@/components/MapCTA';
import TrustFactors from '@/components/TrustFactors';
import Testimonials from '@/components/Testimonials';
import Footer from '@/components/Footer';
import Features from '@/components/Features';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/translations';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Property } from '@/lib/api';
import { handleError } from '@/lib/utils';

// Define the Review interface
interface Review {
  _id: string;
  userId: string;
  propertyId: string;
  rating: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  property?: {
    _id: string;
    title: string;
    image?: string;
  };
}

export default function Home() {
  const { language } = useLanguage();
  const t = translations[language];
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [testimonials, setTestimonials] = useState<Review[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch featured properties and testimonials
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('Attempting to fetch featured properties...');
        
        // Fetch featured properties using the dedicated API endpoint
        const propertyResponse = await fetch('/api/properties/featured');
        
        if (!propertyResponse.ok) {
          throw new Error(`Failed to fetch featured properties: ${propertyResponse.status}`);
        }
        
        const propertyData = await propertyResponse.json();
        console.log('Fetched properties:', propertyData);
        
        if (propertyData && propertyData.length > 0) {
          setFeaturedProperties(propertyData);
        } else {
          setFeaturedProperties([]);
        }

        // Fetch testimonials
        try {
          const testimonialResponse = await fetch('/api/reviews');
          if (testimonialResponse.ok) {
            const testimonialData = await testimonialResponse.json();
            // Take only the top 3 testimonials for the homepage
            setTestimonials(Array.isArray(testimonialData) ? testimonialData.slice(0, 3) : []);
          }
        } catch (testimonialError) {
          console.error("Error fetching testimonials:", testimonialError);
          // Don't set main error state for testimonials, just log it
        }

        setError(null);
      } catch (err) {
        console.error("Error fetching featured properties:", err);
        setFeaturedProperties([]);
        setError("Failed to load featured properties. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <main className="flex min-h-screen flex-col">
      <Hero />
      <Features />
      
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t?.featured?.title}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8">
              {t?.featured?.subtitle}
            </p>
            <div className="w-20 h-1 bg-primary mx-auto rounded-full" />
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              {[...Array(2)].map((_, index) => (
                <div 
                  key={index} 
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden h-64 md:h-56 animate-pulse"
                >
                  <div className="h-full md:w-2/5 md:h-full bg-gray-200 dark:bg-gray-700 float-left md:float-none" />
                  <div className="p-5 md:ml-[40%]">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-4" />
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mt-8" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500 mb-4">{error}</p>
              <Button 
                onClick={() => window.location.reload()}
                variant="outline"
              >
                Retry
              </Button>
            </div>
          ) : featuredProperties.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400 mb-4">No featured properties are currently available.</p>
              <Button
                asChild
                variant="default"
                size="lg"
                className="font-medium"
              >
                <Link href="/browse" className="inline-flex items-center gap-2">
                  Browse All Properties
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          ) : (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                {featuredProperties.map((property, index) => (
                  <PropertyCard 
                    key={property._id} 
                    property={property}
                    featured={index === 0}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="text-center">
            <Button
              asChild
              variant="outline"
              size="lg"
              className="font-medium"
            >
              <Link href="/browse" className="inline-flex items-center gap-2">
                {t?.browse?.title}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <MapCTA />
      <TrustFactors />
      <Testimonials testimonials={testimonials} />
      <Footer />
    </main>
  );
}