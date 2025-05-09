"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Phone, MapPin, ArrowLeft, Send, Instagram } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import Footer from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/translations';

export default function ContactPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { language } = useLanguage();
  const t = translations[language];
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  // Create a proper contact form strings object
  const contactStrings = {
    title: t?.contact?.title || 'Contact Us',
    subtitle: t?.contact?.subtitle || 'We\'d love to hear from you',
    name: t?.contact?.name || 'Your Name',
    email: t?.contact?.email || 'Email Address',
    phone: t?.contact?.phone || 'Phone Number (Optional)',
    message: t?.contact?.message || 'Your Message',
    send: t?.contact?.send || 'Send Message',
    success: t?.contact?.success || 'Your message has been sent successfully!',
    error: t?.contact?.error || 'Failed to send message. Please try again.'
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // TODO: Replace with actual API call to send email
      // Example implementation:
      // const response = await fetch('/api/contact', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(formData),
      // });
      // if (!response.ok) throw new Error('Failed to send message');
      
      // Temporary simulation for demo purposes
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Success!",
        description: contactStrings.success,
      });
      
      // Reset form data
      setFormData({
        name: '',
        email: '',
        phone: '',
        message: '',
      });
      
    } catch (error) {
      toast({
        title: "Error",
        description: contactStrings.error,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
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

      <div className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {contactStrings.title}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              {contactStrings.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            <div className="md:col-span-2 space-y-6">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  {typeof t?.footer?.contact?.title === 'string' ? t.footer.contact.title : 'Contact Information'}
                </h2>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <Mail className="h-5 w-5 text-primary mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Email</p>
                      <a href="mailto:Jumachambala@gmail.com" className="text-gray-900 dark:text-white hover:text-primary">
                        Jumachambala@gmail.com
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Phone className="h-5 w-5 text-primary mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Phone</p>
                      <a href="tel:+255654051913" className="text-gray-900 dark:text-white hover:text-primary">
                        +255 654051913
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-primary mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Address</p>
                      <address className="not-italic text-gray-900 dark:text-white">
                        Dar es Salaam, Tanzania
                      </address>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Instagram className="h-5 w-5 text-primary mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Instagram</p>
                      <a href="https://www.instagram.com/gazarenter?igsh=MXVlazBlNjVwa3ByNg%3D%3D&utm_source=qr" className="text-gray-900 dark:text-white hover:text-primary">
                        @gazarenter
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  {typeof t?.contact?.hours === 'string' ? t.contact.hours : 'Business Hours'}
                </h2>
                {/* TODO: Replace with actual business hours from a database or CMS */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Monday - Friday</span>
                    <span className="text-gray-900 dark:text-white">9:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Saturday</span>
                    <span className="text-gray-900 dark:text-white">10:00 AM - 4:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Sunday</span>
                    <span className="text-gray-900 dark:text-white">Closed</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="md:col-span-3">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  {typeof t?.contact?.formTitle === 'string' ? t.contact.formTitle : 'Send us a Message'}
                </h2>
                
                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div>
                    <Label htmlFor="name">
                      {contactStrings.name}
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email">
                      {contactStrings.email}
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="phone">
                      {contactStrings.phone}
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="message">
                      {contactStrings.message}
                    </Label>
                    <Textarea
                      id="message"
                      name="message"
                      required
                      value={formData.message}
                      onChange={handleInputChange}
                      className="mt-1 min-h-[120px]"
                    />
                  </div>
                  
                  <Button 
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {typeof t?.contact?.sending === 'string' ? t.contact.sending : 'Sending...'}
                      </span>
                    ) : (
                      <span className="flex items-center justify-center">
                        <Send className="h-5 w-5 mr-2" />
                        {contactStrings.send}
                      </span>
                    )}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
} 