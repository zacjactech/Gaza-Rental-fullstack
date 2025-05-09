"use client"

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Footer from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/translations';
import { handleError } from '@/lib/utils';

// Review interface to match API data format
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

export default function TestimonialsPage() {
  const { language } = useLanguage();
  const t = translations[language];
  const [testimonials, setTestimonials] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/reviews');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch testimonials: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (Array.isArray(data)) {
          setTestimonials(data);
        } else {
          console.error('Unexpected response format:', data);
          setTestimonials([]);
          setError('Received invalid data format from the server');
        }
      } catch (err) {
        console.error('Error fetching testimonials:', err);
        setError(handleError(err));
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  // Format date for display
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

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <Link href="/" className="flex items-center text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">
              <ArrowLeft className="h-4 w-4 mr-1" />
              <span>{t?.common?.backToHome || 'Back to Home'}</span>
            </Link>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">{t?.common?.loading || 'Loading testimonials...'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="flex items-center text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">
            <ArrowLeft className="h-4 w-4 mr-1" />
            <span>{t?.common?.backToHome || 'Back to Home'}</span>
          </Link>
        </div>
      </div>

      {/* Hero section */}
      <section className="bg-primary text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            {t?.testimonials?.title || 'What Our Clients Say'}
          </h1>
          <p className="text-lg md:text-xl max-w-3xl mx-auto opacity-90">
            {t?.testimonials?.subtitle || 'Hear from our satisfied clients about their experiences finding their perfect rental property with us.'}
          </p>
        </div>
      </section>

      {/* Testimonials grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {error ? (
            <div className="max-w-3xl mx-auto text-center bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md">
              <p className="text-red-500 mb-6">{error}</p>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
              >
                {t?.common?.retry || 'Retry'}
              </Button>
            </div>
          ) : testimonials.length === 0 ? (
            <div className="max-w-3xl mx-auto text-center bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md">
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {t?.testimonials?.noTestimonials || 'No testimonials available at the moment. Be the first to share your experience!'}
              </p>
              <Button
                variant="outline"
                size="lg"
                className="font-medium"
                asChild
              >
                <Link href="/contact">
                  {t?.testimonials?.contactUs || 'Contact Us'}
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {testimonials.map((testimonial) => (
                <div 
                  key={testimonial._id} 
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex flex-col hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden relative mr-4 bg-gray-200 dark:bg-gray-700">
                      {testimonial.user?.avatar ? (
                        <Image
                          src={testimonial.user.avatar}
                          alt={testimonial.user.name || 'User'}
                          fill
                          className="object-cover"
                          sizes="48px"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/images/default-avatar.jpg';
                          }}
                        />
                      ) : (
                        <Image
                          src="/images/default-avatar.jpg"
                          alt={testimonial.user?.name || 'User'}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {testimonial.user?.name || 'Anonymous User'}
                      </h3>
                      {testimonial.property && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {testimonial.property.title}
                        </p>
                      )}
                      <div className="flex items-center mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-4 w-4 ${
                              i < testimonial.rating
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300 dark:text-gray-600'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 italic mb-4 flex-grow">
                    &quot;{testimonial.content}&quot;
                  </p>
                  <div className="text-sm text-gray-500 dark:text-gray-400 pt-3 border-t border-gray-100 dark:border-gray-700">
                    {formatDate(testimonial.createdAt)}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* CTA Section */}
          <div className="mt-16 text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {t?.testimonials?.cta?.title || 'Ready to Find Your New Home?'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8">
              {t?.testimonials?.cta?.subtitle || 'Join our satisfied customers and find your perfect rental property today.'}
            </p>
            <Button asChild size="lg">
              <Link href="/browse">
                {t?.testimonials?.cta?.button || 'Browse Properties'}
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
} 