"use client"

import { useState, useEffect } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { translations } from '@/translations'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useRouter } from 'next/navigation'
import { useUser } from '@/contexts/UserContext'
import Image from 'next/image'
import Link from 'next/link'
import { CalendarDays, Clock, AlertCircle } from 'lucide-react'

export default function TenantApplicationsPage() {
  const { language } = useLanguage()
  const { user } = useUser()
  const t = translations[language]
  const router = useRouter()
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch user's bookings/applications
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await fetch('/api/bookings')
        if (!response.ok) {
          throw new Error('Failed to fetch bookings')
        }
        const data = await response.json()
        setBookings(data)
      } catch (error) {
        console.error('Error fetching bookings:', error)
        setError('Failed to load applications')
      } finally {
        setLoading(false)
      }
    }

    fetchBookings()
  }, [])

  if (!user) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-bold mb-4">Please log in to access your applications</h2>
        <Button onClick={() => router.push('/login')}>
          Go to Login
        </Button>
      </div>
    )
  }

  // Group bookings by status
  const pendingBookings = bookings.filter(booking => booking.status === 'pending')
  const approvedBookings = bookings.filter(booking => booking.status === 'approved')
  const rejectedBookings = bookings.filter(booking => booking.status === 'rejected')
  const cancelledBookings = bookings.filter(booking => booking.status === 'cancelled')

  // Application card component
  const ApplicationCard = ({ booking }: { booking: any }) => {
    const statusColors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800'
    }
    
    return (
      <Card className="flex flex-col md:flex-row overflow-hidden mb-4">
        <div className="relative h-32 md:h-auto md:w-1/4 min-w-[100px]">
          <Image 
            src={booking.property?.images?.[0] || '/images/placeholder-property.jpg'} 
            alt={booking.property?.title || 'Property'}
            fill
            className="object-cover"
          />
        </div>
        <div className="flex-1 p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-lg">{booking.property?.title || 'Property'}</h3>
              <p className="text-sm text-muted-foreground">{booking.property?.location || 'Location unavailable'}</p>
            </div>
            <Badge className={statusColors[booking.status] || 'bg-gray-100'}>
              {booking.status}
            </Badge>
          </div>
          
          <div className="mt-2 flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-1">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              <p>Start: {new Date(booking.startDate).toLocaleDateString()}</p>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <p>{booking.duration} {booking.duration === 1 ? 'month' : 'months'}</p>
            </div>
            <div>
              <p className="font-medium">${booking.property?.price}/month</p>
            </div>
          </div>
          
          <div className="mt-4 flex justify-end gap-2">
            <Link href={`/properties/${booking.property?._id}`}>
              <Button variant="outline" size="sm">View property</Button>
            </Link>
            <Link href={`/dashboard/tenant/applications/${booking._id}`}>
              <Button size="sm">View details</Button>
            </Link>
          </div>
        </div>
      </Card>
    )
  }

  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="flex items-center space-x-4">
          <Skeleton className="h-32 w-32 rounded-md" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
            <div className="flex gap-4 mt-4">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-4 w-[100px]" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t.myApplications || 'My Applications'}</h1>
          <p className="text-muted-foreground">{t.manageRentalApplications || 'Track and manage your rental applications'}</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button onClick={() => router.push('/browse')}>
            Browse Properties
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6 flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All ({bookings.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pendingBookings.length})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({approvedBookings.length})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({rejectedBookings.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          {loading ? (
            <LoadingSkeleton />
          ) : bookings.length > 0 ? (
            <div className="space-y-4">
              {bookings.map(booking => (
                <ApplicationCard key={booking._id} booking={booking} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <h3 className="text-lg font-medium mb-2">No Applications Found</h3>
              <p className="text-muted-foreground mb-4">You haven't submitted any rental applications yet</p>
              <Button onClick={() => router.push('/browse')}>
                Browse Properties
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="pending">
          {loading ? (
            <LoadingSkeleton />
          ) : pendingBookings.length > 0 ? (
            <div className="space-y-4">
              {pendingBookings.map(booking => (
                <ApplicationCard key={booking._id} booking={booking} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <h3 className="text-lg font-medium mb-2">No Pending Applications</h3>
              <p className="text-muted-foreground mb-4">You don't have any pending rental applications</p>
              <Button onClick={() => router.push('/browse')}>
                Browse Properties
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="approved">
          {loading ? (
            <LoadingSkeleton />
          ) : approvedBookings.length > 0 ? (
            <div className="space-y-4">
              {approvedBookings.map(booking => (
                <ApplicationCard key={booking._id} booking={booking} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <h3 className="text-lg font-medium mb-2">No Approved Applications</h3>
              <p className="text-muted-foreground mb-4">You don't have any approved rental applications yet</p>
              <Button onClick={() => router.push('/browse')}>
                Browse Properties
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="rejected">
          {loading ? (
            <LoadingSkeleton />
          ) : rejectedBookings.length > 0 ? (
            <div className="space-y-4">
              {rejectedBookings.map(booking => (
                <ApplicationCard key={booking._id} booking={booking} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <h3 className="text-lg font-medium mb-2">No Rejected Applications</h3>
              <p className="text-muted-foreground mb-4">You don't have any rejected rental applications</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
} 