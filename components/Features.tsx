"use client"

import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/translations';
import { Shield, CreditCard, Headphones, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface Feature {
  icon: JSX.Element;
  titleKey: string;
  descriptionKey: string;
  link?: string;
}

const Features = () => {
  const { language } = useLanguage();
  const t = translations[language];

  const features: Feature[] = [
    {
      icon: <Shield className="h-8 w-8 text-primary" />,
      titleKey: 'verified',
      descriptionKey: 'verified',
      link: '/about#verification'
    },
    {
      icon: <CreditCard className="h-8 w-8 text-primary" />,
      titleKey: 'secure',
      descriptionKey: 'secure',
      link: '/about#security'
    },
    {
      icon: <Headphones className="h-8 w-8 text-primary" />,
      titleKey: 'support',
      descriptionKey: 'support',
      link: '/contact'
    }
  ];

  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {t.features.title}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {t.features.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={feature.titleKey}
              className="group bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="mb-4 transform group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {t.features[feature.titleKey].title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {t.features[feature.descriptionKey].description}
              </p>
              {feature.link && (
                <Link 
                  href={feature.link}
                  className="inline-flex items-center text-primary hover:text-primary/80 transition-colors duration-300"
                >
                  <span className="mr-1">{t.features.learnMore}</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button asChild size="lg">
            <Link href="/about" className="inline-flex items-center">
              {t.features.exploreMore}
              <ChevronRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Features; 