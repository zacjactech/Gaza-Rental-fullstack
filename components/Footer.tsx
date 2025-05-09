"use client";

import Link from 'next/link';
import { Facebook, Twitter, Instagram, Home, Mail, Phone } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/translations';

const Footer = () => {
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <footer className="bg-gray-900 text-white pt-12 pb-6 border-t-2 border-primary/20">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Home className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl">GazaRenter</span>
            </div>
            <p className="text-gray-400 mb-4">
              {t.footer.about.description}
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="https://www.instagram.com/gazarenter" className="text-gray-400 hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4">{t.footer.quickLinks.title}</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-400 hover:text-primary transition-colors">
                  {t.footer.quickLinks.home}
                </Link>
              </li>
              <li>
                <Link href="/browse" className="text-gray-400 hover:text-primary transition-colors">
                  {t.footer.quickLinks.browse}
                </Link>
              </li>
              <li>
                <Link href="/map-view" className="text-gray-400 hover:text-primary transition-colors">
                  {t.footer.quickLinks.mapView}
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-400 hover:text-primary transition-colors">
                  {t.footer.quickLinks.about}
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4">{t.footer.cities.title}</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/browse?location=dar-es-salaam" className="text-gray-400 hover:text-primary transition-colors">
                  {t.footer.cities.darEsSalaam}
                </Link>
              </li>
              <li>
                <Link href="/browse?location=arusha" className="text-gray-400 hover:text-primary transition-colors">
                  {t.footer.cities.arusha}
                </Link>
              </li>
              <li>
                <Link href="/browse?location=mwanza" className="text-gray-400 hover:text-primary transition-colors">
                  {t.footer.cities.mwanza}
                </Link>
              </li>
              <li>
                <Link href="/browse?location=dodoma" className="text-gray-400 hover:text-primary transition-colors">
                  {t.footer.cities.dodoma}
                </Link>
              </li>
              <li>
                <Link href="/browse?location=zanzibar" className="text-gray-400 hover:text-primary transition-colors">
                  {t.footer.cities.zanzibar}
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4">{t.footer.contact.title}</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <Mail className="h-5 w-5 text-primary mr-2 mt-0.5" />
                <a href="mailto:Jumachambala@gmail.com" className="text-gray-400 hover:text-primary transition-colors">
                  Jumachambala@gmail.com
                </a>
              </li>
              <li className="flex items-start">
                <Phone className="h-5 w-5 text-primary mr-2 mt-0.5" />
                <a href="tel:+255654051913" className="text-gray-400 hover:text-primary transition-colors">
                  +255 654051913
                </a>
              </li>
              <li className="flex items-start">
                <Home className="h-5 w-5 text-primary mr-2 mt-0.5" />
                <span className="text-gray-400">Dar es Salaam</span>
              </li>
              <li className="flex items-start">
                <Instagram className="h-5 w-5 text-primary mr-2 mt-0.5" />
                <a href="https://www.instagram.com/gazarenter?igsh=MXVlazBlNjVwa3ByNg%3D%3D&utm_source=qr" className="text-gray-400 hover:text-primary transition-colors">
                  @gazarenter
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} GazaRenter. {t.footer.copyright}
            </p>
            <div className="flex space-x-4">
              <Link href="/terms" className="text-gray-400 hover:text-primary transition-colors text-sm">
                {t.footer.terms}
              </Link>
              <Link href="/privacy" className="text-gray-400 hover:text-primary transition-colors text-sm">
                {t.footer.privacy}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;