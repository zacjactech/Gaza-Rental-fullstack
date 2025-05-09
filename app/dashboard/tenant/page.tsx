"use client"

import { useState, useEffect } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { translations } from '@/translations'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Home, Users, Bell, CalendarDays, CreditCard, ArrowUpRight, Heart, Clock } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import Image from 'next/image'
import Link from 'next/link'
import { useUser } from '@/contexts/UserContext'

// Property card component for saved properties
const PropertyCard = ({ property }: { property: any }) => {
  return (
    <Card className="overflow-hidden group transition-all hover:shadow-md">
      <div className="relative h-48 w-full">
        <Image 
          src={property.images?.[0] || '/images/placeholder-property.jpg'} 
          alt={property.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <Badge className="absolute top-3 right-3 bg-white/80 text-black hover:bg-white/70">
          ${property.price}/mo
        </Badge>
      </div>
      <CardContent className="pt-4">
        <h3 className="font-semibold text-lg line-clamp-1">{property.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-1">{property.location}</p>
        <div className="flex gap-2 text-sm text-muted-foreground mt-2">
          <span>{property.bedrooms} beds</span>
          <span>•</span>
          <span>{property.bathrooms} baths</span>
          <span>•</span>
          <span>{property.area} m²</span>
        </div>
      </CardContent>
      <CardFooter className="border-t px-4 py-3 flex justify-between">
        <Link href={`/properties/${property._id}`}>
          <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs">
            View details <ArrowUpRight className="h-3 w-3" />
          </Button>
        </Link>
        <Badge variant={property.status === 'available' ? 'success' : 'secondary'} className="h-6">
          {property.status}
        </Badge>
      </CardFooter>
    </Card>
  )
}

// Booking card component
const BookingCard = ({ booking }: { booking: any }) => {
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
          <div>
            <p className="font-medium">Start Date</p>
            <p>{new Date(booking.startDate).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="font-medium">Duration</p>
            <p>{booking.duration} {booking.duration === 1 ? 'month' : 'months'}</p>
          </div>
          <div>
            <p className="font-medium">Monthly Price</p>
            <p>${booking.property?.price}</p>
          </div>
        </div>
        
        <div className="mt-3 flex justify-end">
          <Link href={`/dashboard/tenant/applications/${booking._id}`}>
            <Button variant="outline" size="sm">View details</Button>
          </Link>
        </div>
      </div>
    </Card>
  )
}

export default function TenantDashboardPage() {
  const { language } = useLanguage()
  const { user } = useUser()
  const t = translations[language]
  const router = useRouter()
  const [favorites, setFavorites] = useState<any[]>([])
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState({
    favorites: true,
    bookings: true
  })
  const [error, setError] = useState<string | null>(null)

  // Fetch user's favorite properties
  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const response = await fetch('/api/favorites')
        if (!response.ok) {
          throw new Error('Failed to fetch favorites')
        }
        const data = await response.json()
        setFavorites(data)
      } catch (error) {
        console.error('Error fetching favorites:', error)
        setError('Failed to load saved properties')
      } finally {
        setLoading(prev => ({ ...prev, favorites: false }))
      }
    }

    if (user) {
      fetchFavorites()
    }
  }, [user])

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
        setLoading(prev => ({ ...prev, bookings: false }))
      }
    }

    if (user) {
      fetchBookings()
    }
  }, [user])

  // Filter bookings by status
  const pendingBookings = bookings.filter(booking => booking.status === 'pending')
  const approvedBookings = bookings.filter(booking => booking.status === 'approved')
  const upcomingViewings = approvedBookings.filter(booking => 
    new Date(booking.startDate) > new Date()
  ).slice(0, 3)

  if (!user) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-bold mb-4">Please log in to access your dashboard</h2>
        <Button onClick={() => router.push('/login')}>
          Go to Login
        </Button>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t.tenantDashboard || 'Tenant Dashboard'}</h1>
          <p className="text-muted-foreground">{t.manageRentalApplications || 'Manage your rental applications and saved properties'}</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button onClick={() => router.push('/browse')}>
            Browse Properties
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t.activeApplications || 'Active Applications'}</CardTitle>
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading.bookings ? <Skeleton className="h-8 w-16" /> : pendingBookings.length}</div>
            <p className="text-xs text-muted-foreground">
              {!loading.bookings && pendingBookings.length === 0 
                ? t.noActiveApplications || 'No active applications' 
                : t.pendingReview || 'Pending review'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t.savedProperties || 'Saved Properties'}</CardTitle>
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary">
              <Heart className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading.favorites ? <Skeleton className="h-8 w-16" /> : favorites.length}</div>
            <p className="text-xs text-muted-foreground">
              {!loading.favorites && favorites.length === 0 
                ? t.noSavedProperties || 'No saved properties' 
                : t.propertiesSaved || 'Properties saved'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t.upcomingViewings || 'Upcoming Viewings'}</CardTitle>
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary">
              <CalendarDays className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading.bookings ? <Skeleton className="h-8 w-16" /> : upcomingViewings.length}</div>
            <p className="text-xs text-muted-foreground">
              {!loading.bookings && upcomingViewings.length === 0 
                ? t.noScheduledViewings || 'No scheduled viewings' 
                : t.upcomingAppointments || 'Scheduled appointments'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t.approvedApplications || 'Approved Applications'}</CardTitle>
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary">
              <CreditCard className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading.bookings ? <Skeleton className="h-8 w-16" /> : approvedBookings.length}</div>
            <p className="text-xs text-muted-foreground">
              {!loading.bookings && approvedBookings.length === 0 
                ? t.noApprovedApplications || 'No approved applications' 
                : t.approvedRentals || 'Approved rentals'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="applications" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="saved">Saved Properties</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming Viewings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="applications" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Your Rental Applications</h2>
            <Link href="/dashboard/tenant/applications">
              <Button variant="ghost" size="sm" className="gap-1">
                View all <ArrowUpRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          
          {loading.bookings ? (
            <div className="space-y-4">
              {[1, 2].map(i => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-32 w-32 rounded-md" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-4 w-[150px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : bookings.length > 0 ? (
            <div className="space-y-4">
              {bookings.slice(0, 3).map(booking => (
                <BookingCard key={booking._id} booking={booking} />
              ))}
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No Applications Yet</CardTitle>
                <CardDescription>
                  You haven't submitted any rental applications yet
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4">Start your rental journey by browsing available properties and submitting applications.</p>
                <Button onClick={() => router.push('/browse')}>
                  Browse Properties
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="saved">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Saved Properties</h2>
            <Link href="/dashboard/tenant/saved">
              <Button variant="ghost" size="sm" className="gap-1">
                View all <ArrowUpRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          
          {loading.favorites ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                  <CardContent className="pt-4">
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : favorites.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {favorites.slice(0, 6).map(property => (
                <PropertyCard key={property._id} property={property} />
              ))}
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No Saved Properties</CardTitle>
                <CardDescription>
                  You haven't saved any properties to your favorites yet
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4">Save properties you're interested in to revisit them later</p>
                <Button onClick={() => router.push('/browse')}>
                  Browse Properties
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="upcoming">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Upcoming Viewings</h2>
          </div>
          
          {loading.bookings ? (
            <div className="space-y-4">
              {[1, 2].map(i => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-32 w-32 rounded-md" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-4 w-[150px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : upcomingViewings.length > 0 ? (
            <div className="space-y-4">
              {upcomingViewings.map(booking => (
                <BookingCard key={booking._id} booking={booking} />
              ))}
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No Upcoming Viewings</CardTitle>
                <CardDescription>
                  You don't have any scheduled property viewings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4">Once your application is approved, you can schedule property viewings</p>
                <Button onClick={() => router.push('/browse')}>
                  Browse Properties
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
} 