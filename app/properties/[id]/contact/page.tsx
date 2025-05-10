"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Mail, Phone, MessageCircle, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import Footer from '@/components/Footer';

export default function ContactLandlord({ params }: { params: { id: string } }) {
  const [propertyId, setPropertyId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [property, setProperty] = useState<any>(null);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [showContact, setShowContact] = useState(false);
  
  const router = useRouter();
  const { toast } = useToast();
  
  useEffect(() => {
    if (params && params.id) {
      setPropertyId(params.id);
      fetchProperty(params.id);
    }
  }, [params]);
  
  const fetchProperty = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/properties/${id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch property data');
      }
      
      const data = await response.json();
      setProperty(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching property:', error);
      toast({
        title: "Error",
        description: "Failed to load property details. Please try again.",
        variant: "destructive",
      });
      router.push(`/properties/${id}`);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter a message",
        variant: "destructive",
      });
      return;
    }
    
    try {
      if (!property?.landlordId || typeof property.landlordId !== 'object') {
        throw new Error('Landlord information is not available');
      }
      
      // Create message data object
      const messageData = {
        recipientId: property.landlordId._id || property.landlordId,
        propertyId,
        content: message,
        subject: subject || `Inquiry about ${property.title}`
      };
      
      // Send message data to API
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send message');
      }
      
      toast({
        title: "Message Sent",
        description: "Your message has been sent to the landlord!",
      });
      
      // Clear the form
      setMessage('');
      setSubject('');
      
      // Redirect back to the property page after a short delay
      setTimeout(() => {
        router.push(`/properties/${propertyId}`);
      }, 2000);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "There was a problem sending your message. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    );
  }
  
  return (
    <main className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center">
            <Link href={`/properties/${propertyId}`} className="flex items-center text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">
              <ArrowLeft className="h-4 w-4 mr-1" />
              <span>Back to Property</span>
            </Link>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Contact Landlord
          </h1>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                About the Property
              </h2>
              
              <div className="flex items-start">
                <div className="relative h-20 w-20 rounded-md overflow-hidden mr-4 bg-gray-200 dark:bg-gray-700">
                  <Image
                    src={property?.image || '/images/property-placeholder.jpg'}
                    alt={property?.title || 'Property'}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {property?.title || 'Property'}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {property?.location || 'Location'}
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mt-2">
                    {property?.currency || 'TZS'} {property?.price?.toLocaleString() || '0'} / {property?.period || 'month'}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Landlord Information */}
            <div className="mb-6 border-t border-gray-200 dark:border-gray-700 pt-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Landlord Details
              </h2>
              
              {property?.landlordId && (
                <div className="flex items-start mb-4">
                  <div className="relative h-16 w-16 rounded-full overflow-hidden mr-4 bg-gray-200 dark:bg-gray-700">
                    {property.landlordId.avatar ? (
                      <Image
                        src={property.landlordId.avatar}
                        alt={property.landlordId.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-primary/10 text-primary">
                        {property.landlordId.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white flex items-center">
                      {property.landlordId.name}
                      {property.landlordId.verified && (
                        <span className="ml-1 text-blue-500">
                          <Check className="h-4 w-4" />
                        </span>
                      )}
                    </h3>
                    
                    {showContact ? (
                      <div className="mt-2 space-y-1">
                        {property.landlordId.phone && (
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <Phone className="h-4 w-4 mr-2 text-primary" />
                            <a href={`tel:${property.landlordId.phone}`} className="hover:text-primary">
                              {property.landlordId.phone}
                            </a>
                          </div>
                        )}
                        {property.landlordId.email && (
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <Mail className="h-4 w-4 mr-2 text-primary" />
                            <a href={`mailto:${property.landlordId.email}`} className="hover:text-primary">
                              {property.landlordId.email}
                            </a>
                          </div>
                        )}
                      </div>
                    ) : (
                      <Button 
                        variant="outline" 
                        className="mt-2 h-8 text-xs"
                        onClick={() => setShowContact(true)}
                      >
                        <Phone className="h-3 w-3 mr-1" />
                        Show Contact Details
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {/* Message Form */}
            <form onSubmit={handleSubmit} className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Send a Message
              </h2>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    placeholder="Regarding your property..."
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Hello, I am interested in your property..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="mt-1"
                    rows={5}
                    required
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary/80 text-white py-2"
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Send Message
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      <Footer />
    </main>
  );
} 