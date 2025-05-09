"use client"

import { Shield, CreditCard, Users, Star } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/translations';

interface TrustFactor {
  icon: JSX.Element;
  title: string;
  description: string;
}

const TrustFactors = () => {
  const { language } = useLanguage();
  const t = translations[language];

  const factors: TrustFactor[] = [
    {
      icon: <Shield className="h-12 w-12 text-primary" />,
      title: t?.trust?.verified?.title || 'Verified Properties',
      description: t?.trust?.verified?.description || 'All our properties are thoroughly verified to ensure quality and authenticity'
    },
    {
      icon: <CreditCard className="h-12 w-12 text-primary" />,
      title: t?.trust?.secure?.title || 'Secure Payments',
      description: t?.trust?.secure?.description || 'Your payments are protected with state-of-the-art security'
    },
    {
      icon: <Users className="h-12 w-12 text-primary" />,
      title: t?.trust?.landlords?.title || 'Verified Landlords',
      description: t?.trust?.landlords?.description || 'We work only with verified and trustworthy property owners'
    },
    {
      icon: <Star className="h-12 w-12 text-primary" />,
      title: t?.trust?.quality?.title || 'Quality Assurance',
      description: t?.trust?.quality?.description || 'We maintain high standards for all listed properties'
    }
  ];

  return (
    <section className="py-4 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {factors.map((factor, index) => (
            <div 
              key={factor.title}
              className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg text-center hover:shadow-lg transition-shadow duration-300"
            >
              <div className="flex justify-center mb-4">
                {factor.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {factor.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {factor.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustFactors;