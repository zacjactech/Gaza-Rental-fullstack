"use client";

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import Footer from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/translations';

export default function TermsPage() {
  const { language } = useLanguage();
  const t = translations[language];

  const sections = [
    {
      title: t?.terms?.sections?.acceptance?.title || 'Acceptance of Terms',
      content: t?.terms?.sections?.acceptance?.content || 'By accessing or using the GazaRenter platform, you agree to be bound by these Terms and Conditions and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.'
    },
    {
      title: t?.terms?.sections?.account?.title || 'User Accounts',
      content: t?.terms?.sections?.account?.content || 'To use certain features of the Site, you must register for an account. You must provide accurate and complete information and keep your account information updated. You are responsible for maintaining the confidentiality of your account and password and for restricting access to your computer. You agree to accept responsibility for all activities that occur under your account or password.'
    },
    {
      title: t?.terms?.sections?.listings?.title || 'Property Listings',
      content: t?.terms?.sections?.listings?.content || 'Property listings on GazaRenter must be accurate and truthful. Landlords are responsible for ensuring that their listings comply with all applicable laws and regulations. GazaRenter reserves the right to remove any listing that violates these terms. Users are encouraged to report any suspicious or inaccurate listings.'
    },
    {
      title: t?.terms?.sections?.payments?.title || 'Payments and Fees',
      content: t?.terms?.sections?.payments?.content || 'GazaRenter may charge fees for certain services. All fees are non-refundable unless otherwise stated. By using the platform, you agree to pay all fees and charges associated with your account. Failure to pay fees may result in suspension or termination of your account.'
    },
    {
      title: t?.terms?.sections?.communication?.title || 'Communication',
      content: t?.terms?.sections?.communication?.content || 'By creating an account, you agree to receive communications from GazaRenter, including but not limited to emails, text messages, and push notifications. You can opt out of promotional communications, but service-related communications are necessary for the operation of your account.'
    },
    {
      title: t?.terms?.sections?.conduct?.title || 'User Conduct',
      content: t?.terms?.sections?.conduct?.content || 'You agree not to use the Site for any illegal or unauthorized purpose. You must not, in the use of the Service, violate any laws in your jurisdiction (including but not limited to copyright laws). You are responsible for all activity that occurs under your account.'
    },
    {
      title: t?.terms?.sections?.intellectual?.title || 'Intellectual Property',
      content: t?.terms?.sections?.intellectual?.content || 'The Service and its original content, features, and functionality are and will remain the exclusive property of GazaRenter and its licensors. The Service is protected by copyright, trademark, and other laws. Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of GazaRenter.'
    },
    {
      title: t?.terms?.sections?.termination?.title || 'Termination',
      content: t?.terms?.sections?.termination?.content || 'GazaRenter may terminate or suspend your account immediately, without prior notice or liability, for any reason, including without limitation if you breach the Terms. Upon termination, your right to use the Service will immediately cease.'
    },
    {
      title: t?.terms?.sections?.liability?.title || 'Limitation of Liability',
      content: t?.terms?.sections?.liability?.content || 'In no event shall GazaRenter, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.'
    },
    {
      title: t?.terms?.sections?.changes?.title || 'Changes to Terms',
      content: t?.terms?.sections?.changes?.content || 'We reserve the right, at our sole discretion, to modify or replace these Terms at any time. By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms.'
    }
  ];

  return (
    <main className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center">
            <Link href="/" className="flex items-center text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">
              <ArrowLeft className="h-4 w-4 mr-1" />
              <span>{t?.common?.backToHome || 'Back to Home'}</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 md:p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            {t?.terms?.title || 'Terms and Conditions'}
          </h1>
          
          <p className="text-gray-700 dark:text-gray-300 mb-8">
            {t?.terms?.lastUpdated || 'Last Updated'}: {new Date('2024-06-01').toLocaleDateString()}
          </p>
          
          <div className="space-y-8">
            {sections.map((section, index) => (
              <section key={index} className="border-b border-gray-200 dark:border-gray-700 pb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {index + 1}. {section.title}
                </h2>
                <p className="text-gray-700 dark:text-gray-300">
                  {section.content}
                </p>
              </section>
            ))}
          </div>
          
          <div className="mt-10">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              {t?.terms?.contact?.title || 'Contact Us'}
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              {t?.terms?.contact?.content || 'If you have any questions about these Terms, please contact us at'}{' '}
              <a href="mailto:support@gazarenter.com" className="text-primary hover:underline">
                support@gazarenter.com
              </a>
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
} 