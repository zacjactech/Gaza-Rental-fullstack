"use client";

export const dynamic = 'force-dynamic';
export const runtime = 'edge';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Calendar, Check, ChevronDown, Filter, Search, X, Eye, ThumbsUp, ThumbsDown, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/translations";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useTranslations } from 'next-intl';
import { Booking } from '@/lib/models/booking';
import { handleError } from '@/lib/utils';

// Client-side only wrapper component
function ClientApplicationsPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const t = translations[language];
  const tTranslations = useTranslations('Dashboard.Applications');
  
  // Safe translation function to handle missing keys
  const safeTranslate = (key: string) => {
    try {
      return tTranslations(key);
    } catch (error) {
      console.warn(`Translation key not found: ${key}`);
      return key;
    }
  };
  
  const [applications, setApplications] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    search: '',
    status: 'all'
  });
  
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await fetch('/api/bookings/landlord');
        if (!response.ok) {
          throw new Error('Failed to fetch applications');
        }
        const data = await response.json();
        setApplications(data);
      } catch (err) {
        setError(handleError(err));
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);
  
  const filteredApplications = applications.filter(application => {
    // Skip filtering if property or user is missing
    if (!application.property || !application.user) {
      return false;
    }
    
    const matchesSearch = 
      (application.property.title?.toLowerCase().includes(filters.search.toLowerCase()) || false) ||
      (application.user.name?.toLowerCase().includes(filters.search.toLowerCase()) || false);
    const matchesStatus = filters.status === 'all' || application.status === filters.status;
    return matchesSearch && matchesStatus;
  });
  
  const handleStatusChange = async (applicationId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/bookings/${applicationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update application status');
      }

      // Update local state
      setApplications(applications.map(app => 
        app._id === applicationId ? { ...app, status: newStatus } : app
      ));
    } catch (err) {
      setError(handleError(err));
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
      <h1 className="text-2xl font-bold mb-8">{safeTranslate('title')}</h1>

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
              <SelectItem value="pending">{safeTranslate('pending')}</SelectItem>
              <SelectItem value="approved">{safeTranslate('approved')}</SelectItem>
              <SelectItem value="rejected">{safeTranslate('rejected')}</SelectItem>
              </SelectContent>
            </Select>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">{safeTranslate('property')}</th>
                <th className="text-left py-3 px-4">{safeTranslate('applicant')}</th>
                <th className="text-left py-3 px-4">{safeTranslate('startDate')}</th>
                <th className="text-left py-3 px-4">{safeTranslate('duration')}</th>
                <th className="text-left py-3 px-4">{safeTranslate('status')}</th>
                <th className="text-left py-3 px-4">{safeTranslate('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredApplications.map((application) => (
                <tr key={application._id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <div className="w-12 h-12 rounded overflow-hidden relative mr-3">
                        <img
                          src={application.property.images?.[0] || '/placeholder-property.jpg'}
                          alt={application.property.title || 'Property'}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <div>
                        <div className="font-medium">{application.property.title || 'Untitled Property'}</div>
                        <div className="text-sm text-gray-500">{application.property.location || 'No location'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <div className="w-12 h-12 rounded-full overflow-hidden relative mr-3">
                        <img
                          src={application.user?.avatar || '/placeholder-user.jpg'}
                          alt={application.user?.name || 'User'}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <div>
                        <div className="font-medium">{application.user?.name || 'Unknown User'}</div>
                        <div className="text-sm text-gray-500">{application.user?.email || 'No email'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {application.startDate ? new Date(application.startDate).toLocaleDateString() : 'Not specified'}
                  </td>
                  <td className="py-3 px-4">
                    {application.duration || 0} {safeTranslate('months')}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-sm ${
                      application.status === 'approved' ? 'bg-green-100 text-green-800' :
                      application.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {safeTranslate(application.status || 'pending')}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {application.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusChange(application._id, 'approved')}
                        >
                          {safeTranslate('approve')}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleStatusChange(application._id, 'rejected')}
                        >
                          {safeTranslate('reject')}
                        </Button>
                      </div>
                    )}
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
export default function ApplicationsPage() {
  return (
    <div suppressHydrationWarning>
      {typeof window !== 'undefined' ? <ClientApplicationsPage /> : <div>Loading...</div>}
    </div>
  );
} 