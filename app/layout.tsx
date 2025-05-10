import './globals.css';
import type { Metadata, Viewport } from 'next';
import Header from '@/components/Header';
import { ThemeProvider } from '@/components/ThemeProvider';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { UserProvider } from '@/contexts/UserContext';
import { Toaster } from '@/components/ui/toaster';
import { PageTransition } from '@/components/PageTransition';
import ErrorBoundary from '@/components/ErrorBoundary';
import { Suspense } from 'react';
import ClientScrollToTop from './components/client/ClientScrollToTop';
import DatabaseInitializerWrapper from './components/client/DatabaseInitializerWrapper';

// Define CSS variable for system fonts
const systemFontClass = 'font-system';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: 'GazaRenter - Find Your Home in Tanzania',
  description: 'Tanzania\'s premier house rental platform connecting landlords and tenants with verified listings and secure booking.',
  other: {
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'format-detection': 'telephone=no',
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Remove Google Fonts preconnect links */}
        <link rel="preconnect" href="https://images.pexels.com" />
        <link rel="dns-prefetch" href="https://images.pexels.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#0f172a" media="(prefers-color-scheme: dark)" />
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              const originalConsoleError = console.error;
              console.error = function() {
                if (arguments[0] && arguments[0].includes && 
                    arguments[0].includes('Accessing element.ref was removed in React 19')) {
                  return;
                }
                originalConsoleError.apply(console, arguments);
              };
            })();
          `
        }} />
        <style>
          {`
            .font-system {
              font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
            }
          `}
        </style>
      </head>
      <body className={`${systemFontClass} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
        >
          <LanguageProvider>
            <UserProvider>
              <ErrorBoundary>
                {/* Initialize database connection early */}
                <DatabaseInitializerWrapper />
                <Header />
                <PageTransition>
                  <Suspense fallback={<div className="container py-8">Loading...</div>}>
                    {children}
                  </Suspense>
                </PageTransition>
                <ClientScrollToTop />
                <Toaster />
              </ErrorBoundary>
            </UserProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}