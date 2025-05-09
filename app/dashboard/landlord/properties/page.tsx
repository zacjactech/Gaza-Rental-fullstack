"use client";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Property } from '@/lib/models/property';
import { handleError } from '@/lib/utils';
import Link from 'next/link';
import { PlusCircle, Search, Filter, MoreHorizontal, Edit, Trash, Eye, CheckCircle, Clock, XCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/translations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

// Client-side only wrapper component
function ClientPropertiesPage() {
  const { language } = useLanguage();
  const t = useTranslations('Dashboard.Properties');
  
  const safeTranslate = (key: string) => {
    try {
      return t(key);
    } catch (error) {
      console.warn(`Translation key not found: ${key}`);
      return key;
    }
  };
  
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    search: '',
    status: 'all'
  });

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await fetch('/api/properties/landlord');
        if (!response.ok) {
          throw new Error('Failed to fetch properties');
        }
        const data = await response.json();
        setProperties(data);
      } catch (err) {
        setError(handleError(err));
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  const filteredProperties = properties.filter(property => {
    if (!property.title || !property.location) {
      return false;
    }
    
    const matchesSearch = 
      property.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      property.location.toLowerCase().includes(filters.search.toLowerCase());
    const matchesStatus = filters.status === 'all' || property.status === filters.status;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "available":
        return "success";
      case "rented":
        return "secondary";
      case "pending":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "available":
        return <CheckCircle className="h-4 w-4 mr-1" />;
      case "rented":
        return <Clock className="h-4 w-4 mr-1" />;
      case "pending":
        return <XCircle className="h-4 w-4 mr-1" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">{safeTranslate('title')}</h1>
          <Link href="/dashboard/landlord/properties/new">
          <Button>{safeTranslate('addProperty')}</Button>
          </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex gap-4 mb-6">
              <Input
            placeholder={safeTranslate('searchPlaceholder')}
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            className="max-w-sm"
          />
          <Select
            value={filters.status}
            onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={safeTranslate('statusPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
              <SelectItem value="all">{safeTranslate('allStatus')}</SelectItem>
              <SelectItem value="available">{safeTranslate('available')}</SelectItem>
              <SelectItem value="rented">{safeTranslate('rented')}</SelectItem>
              <SelectItem value="pending">{safeTranslate('pending')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">{safeTranslate('property')}</th>
                <th className="text-left py-3 px-4">{safeTranslate('location')}</th>
                <th className="text-left py-3 px-4">{safeTranslate('price')}</th>
                <th className="text-left py-3 px-4">{safeTranslate('status')}</th>
                <th className="text-left py-3 px-4">{safeTranslate('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredProperties.map((property) => (
                <tr key={property._id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <div className="w-12 h-12 rounded overflow-hidden mr-3 relative">
                        <img
                          src={property.images?.[0] || '/placeholder-property.jpg'}
                          alt={property.title || 'Property'}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <div>
                        <div className="font-medium">{property.title || 'Untitled Property'}</div>
                        <div className="text-sm text-gray-500">
                          {property.bedrooms || 0} {safeTranslate('bedrooms')} • {property.bathrooms || 0} {safeTranslate('bathrooms')}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">{property.location || 'No location'}</td>
                  <td className="py-3 px-4">${property.price ? property.price.toLocaleString() : '0'}/month</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-sm ${
                      property.status === 'available' ? 'bg-green-100 text-green-800' :
                      property.status === 'rented' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {safeTranslate(property.status || 'pending')}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <Link href={`/dashboard/landlord/properties/${property._id}/edit`}>
                        <Button variant="outline" size="sm">{safeTranslate('edit')}</Button>
                              </Link>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          // TODO: Implement delete functionality
                        }}
                      >
                        {safeTranslate('delete')}
                        </Button>
                      </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
          </div>
    </div>
  );
}

// Main page component that safely renders the client component
export default function PropertiesPage() {
  return (
    <div suppressHydrationWarning>
      {typeof window !== 'undefined' ? <ClientPropertiesPage /> : <div>Loading...</div>}
    </div>
  );
} 