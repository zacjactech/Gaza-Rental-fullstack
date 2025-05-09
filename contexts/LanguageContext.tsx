'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { storage, debounce } from '@/lib/utils';

type Language = 'en' | 'sw';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  loading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Use localStorage to persist language preference
  const [language, setLanguageState] = useState<Language>('en');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load language preference from storage
    try {
      const savedLanguage = storage.get<Language>('language', 'en');
      setLanguageState(savedLanguage);
    } catch (error) {
      console.error('Error loading language preference:', error);
      // Default to English if there's an error
      setLanguageState('en');
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce the setLanguage function to prevent rapid changes
  // This helps with performance when the language button is clicked multiple times
  const debouncedSetLanguage = useCallback(
    debounce((lang: Language) => {
      setLanguageState(lang);
      // Use a try-catch block to handle localStorage errors
      try {
        storage.set('language', lang);
      } catch (error) {
        console.error('Error saving language preference:', error);
      }
    }, 300),
    []
  );

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      language,
      setLanguage: debouncedSetLanguage,
      loading,
    }),
    [language, debouncedSetLanguage, loading]
  );

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
} 
