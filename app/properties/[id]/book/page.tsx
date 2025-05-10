"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar as ReactCalendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import Footer from '@/components/Footer';
import { format } from 'date-fns';

export default function BookProperty({ params }: { params: { id: string } }) {
  const [propertyId, setPropertyId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [property, setProperty] = useState<any>(null);
  const [moveInDate, setMoveInDate] = useState<Date | undefined>(undefined);
  const [duration, setDuration] = useState('12');
  const [paymentMethod, setPaymentMethod] = useState('mpesa');
  
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
    
    if (!moveInDate) {
      toast({
        title: "Missing Information",
        description: "Please select a move-in date",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Create booking data object
      const bookingData = {
        propertyId,
        startDate: moveInDate.toISOString(),
        duration: parseInt(duration),
        paymentMethod,
        amount: (property?.price || 0) * parseInt(duration),
        currency: property?.currency || 'TZS',
        status: 'pending'
      };
      
      // Send booking data to API
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create booking');
      }
      
      toast({
        title: "Booking Submitted",
        description: "Your booking request has been submitted successfully!",
      });
      
      // Redirect back to the property page after a short delay
      setTimeout(() => {
        router.push(`/properties/${propertyId}`);
      }, 2000);
    } catch (error) {
      console.error('Error creating booking:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "There was a problem processing your booking. Please try again.",
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
            Book {property?.title || 'Property'}
          </h1>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Booking Details
                  </h2>
                  
                  <div className="grid gap-4">
                    <div>
                      <Label htmlFor="property">Property</Label>
                      <Input 
                        id="property" 
                        value={property?.title || 'Property'} 
                        disabled 
                        className="mt-1 bg-gray-50 dark:bg-gray-700" 
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="price">Price</Label>
                      <Input 
                        id="price" 
                        value={`${property?.currency || 'TZS'} ${property?.price?.toLocaleString() || '0'} / ${property?.period || 'month'}`} 
                        disabled 
                        className="mt-1 bg-gray-50 dark:bg-gray-700" 
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="moveInDate">Move-in Date</Label>
                      <div className="mt-1">
                        <div className="border border-gray-200 dark:border-gray-700 rounded-md p-3">
                          <ReactCalendar
                            mode="single"
                            selected={moveInDate}
                            onSelect={setMoveInDate}
                            disabled={(date) => date < new Date()}
                            className="w-full"
                          />
                        </div>
                        {moveInDate && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                            Selected: {format(moveInDate, 'PPP')}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="duration">Rental Duration</Label>
                      <Select
                        value={duration}
                        onValueChange={setDuration}
                      >
                        <SelectTrigger className="w-full mt-1">
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3">3 months</SelectItem>
                          <SelectItem value="6">6 months</SelectItem>
                          <SelectItem value="12">12 months</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="paymentMethod">Payment Method</Label>
                      <Select
                        value={paymentMethod}
                        onValueChange={setPaymentMethod}
                      >
                        <SelectTrigger className="w-full mt-1">
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mpesa">M-Pesa</SelectItem>
                          <SelectItem value="bank">Bank Transfer</SelectItem>
                          <SelectItem value="card">Credit Card</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-700 dark:text-gray-300">
                      Monthly Rent
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {property?.currency || 'TZS'} {property?.price?.toLocaleString() || '0'}
                    </span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-700 dark:text-gray-300">
                      Duration
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {duration} months
                    </span>
                  </div>
                  <div className="flex justify-between mb-1 pt-2 border-t border-gray-100 dark:border-gray-700">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      Total Cost
                    </span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      {property?.currency || 'TZS'} {((property?.price || 0) * parseInt(duration)).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                    Additional fees may apply based on terms and conditions
                  </p>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary/80 text-white py-2"
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Complete Booking
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