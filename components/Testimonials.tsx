"use client"

import Image from 'next/image';
import Link from 'next/link';
import { Star, Quote } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/translations';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

// Updated interface to match real data from API
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

interface TestimonialsProps {
  testimonials?: Review[];
  limit?: number;
}

const TestimonialCard = ({ testimonial }: { testimonial: Review }) => {
  const { language } = useLanguage();
  const t = translations[language];
  const [imageError, setImageError] = useState(false);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat(language === 'en' ? 'en-US' : 'sw-TZ', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(date);
    } catch (error) {
      return dateString;
    }
  };

  // Create a fallback component for when the image fails to load
  const ImageFallback = () => (
    <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary text-xl font-semibold">
      {testimonial.user?.name.charAt(0).toUpperCase() || 'U'}
    </div>
  );

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 flex flex-col h-full relative">
      <div className="absolute top-6 right-6 text-primary/20 dark:text-primary/10">
        <Quote size={48} />
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative h-16 w-16 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-primary ring-offset-2 dark:ring-offset-gray-800">
          {!imageError ? (
            <Image
              src={testimonial.user?.avatar || '/images/default-avatar.jpg'}
              alt={testimonial.user?.name || 'User'}
              fill
              className="object-cover"
              onError={() => setImageError(true)}
              sizes="(max-width: 768px) 64px, 64px"
              priority
            />
          ) : (
            <ImageFallback />
          )}
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
            {testimonial.user?.name || 'Anonymous User'}
          </h3>
          {testimonial.property && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t?.testimonials?.reviewedProperty}: {testimonial.property.title}
            </p>
          )}
        </div>
      </div>
      
      <div className="flex mb-4">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            className={`h-5 w-5 ${
              i < testimonial.rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300 dark:text-gray-600'
            }`}
          />
        ))}
      </div>
      
      <p className="text-gray-600 dark:text-gray-400 flex-grow relative z-10 text-lg leading-relaxed">
        &ldquo;{testimonial.content}&rdquo;
      </p>

      {testimonial.createdAt && (
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-500">
            {formatDate(testimonial.createdAt)}
          </p>
        </div>
      )}
    </div>
  );
};

const Testimonials = ({ testimonials, limit = 3 }: TestimonialsProps) => {
  const { language } = useLanguage();
  const t = translations[language];
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState<boolean>(testimonials ? false : true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If testimonials are provided as props, use them
    if (testimonials && testimonials.length > 0) {
      setReviews(testimonials.slice(0, limit));
      setLoading(false);
      return;
    }

    // Otherwise fetch from API
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/reviews');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch reviews: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Ensure we have an array and take only the specified limit
        if (Array.isArray(data)) {
          setReviews(data.slice(0, limit));
        } else {
          setReviews([]);
        }
      } catch (err) {
        console.error('Error fetching reviews:', err);
        setError('Failed to load testimonials');
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [testimonials, limit]);

  if (loading) {
    return (
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t?.testimonials?.title}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8">
              {t?.testimonials?.subtitle}
            </p>
            <div className="w-20 h-1 bg-primary mx-auto rounded-full mb-8" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto mb-12">
            {[...Array(limit)].map((_, index) => (
              <div 
                key={index}
                className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md h-64 animate-pulse"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-full bg-gray-300 dark:bg-gray-700" />
                  <div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-24 mb-2" />
                    <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-32" />
                  </div>
                </div>
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-5 h-5 rounded-full bg-gray-300 dark:bg-gray-700" />
                  ))}
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-full" />
                  <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-full" />
                  <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error || !reviews || reviews.length === 0) {
    return (
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t?.testimonials?.title}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8">
              {t?.testimonials?.subtitle}
            </p>
            <div className="w-20 h-1 bg-primary mx-auto rounded-full mb-8" />
          </div>
          
          <div className="max-w-3xl mx-auto text-center bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md">
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {error || "No testimonials available at the moment. Be the first to share your experience!"}
            </p>
            <Button
              variant="outline"
              size="lg"
              className="font-medium"
              asChild
            >
              <Link href="/contact">
                Contact Us
              </Link>
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {t?.testimonials?.title}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8">
            {t?.testimonials?.subtitle}
          </p>
          <div className="w-20 h-1 bg-primary mx-auto rounded-full mb-8" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto mb-12">
          {reviews.map((review) => (
            <TestimonialCard key={review._id} testimonial={review} />
          ))}
        </div>

        <div className="text-center">
          <Button
            variant="outline"
            size="lg"
            className="font-medium"
            asChild
          >
            <Link href="/testimonials">
              {t?.testimonials?.viewAll}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;