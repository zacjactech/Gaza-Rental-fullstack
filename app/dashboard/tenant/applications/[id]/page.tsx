"use client"

import { useState, useEffect } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { translations } from '@/translations'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useRouter } from 'next/navigation'
import { useUser } from '@/contexts/UserContext'
import Image from 'next/image'
import Link from 'next/link'
import { 
  AlertCircle, 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Home, 
  Loader2, 
  MapPin, 
  Phone, 
  User as UserIcon, 
  Mail, 
  MessageSquare,
  X
} from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function ApplicationDetailPage({ params }: { params: { id: string } }) {
  const { language } = useLanguage()
  const { user } = useUser()
  const t = translations[language]
  const router = useRouter()
  const [booking, setBooking] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cancelLoading, setCancelLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)

  // Fetch booking details
  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/bookings/${params.id}`)
        if (!response.ok) {
          throw new Error('Failed to fetch booking details')
        }
        const data = await response.json()
        setBooking(data)
      } catch (error) {
        console.error('Error fetching booking details:', error)
        setError('Failed to load application details')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchBookingDetails()
    }
  }, [params.id])

  // Cancel booking
  const cancelBooking = async () => {
    try {
      setCancelLoading(true)
      const response = await fetch(`/api/bookings/${params.id}/cancel`, {
        method: 'POST',
      })
      
      if (!response.ok) {
        throw new Error('Failed to cancel booking')
      }
      
      // Update the booking data with the cancelled status
      const updatedBooking = await response.json()
      setBooking(updatedBooking)
    } catch (error) {
      console.error('Error cancelling booking:', error)
      setError('Failed to cancel application')
    } finally {
      setCancelLoading(false)
    }
  }

  // Send message to landlord
  const sendMessage = async () => {
    if (!message.trim()) return
    
    try {
      setSendingMessage(true)
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          recipientId: booking.landlordId._id,
          content: message,
          propertyId: booking.property._id
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to send message')
      }
      
      // Clear the message input
      setMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
      setError('Failed to send message')
    } finally {
      setSendingMessage(false)
    }
  }

  if (!user) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-bold mb-4">Please log in to view application details</h2>
        <Button onClick={() => router.push('/login')}>
          Go to Login
        </Button>
      </div>
    )
  }

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          className="mr-4"
          onClick={() => router.push('/dashboard/tenant/applications')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Applications
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Application Details</h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6 flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-6">
            <Skeleton className="h-64 w-full md:w-1/2 rounded-md" />
            <div className="space-y-4 w-full md:w-1/2">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
        </div>
      ) : booking ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main content - 2/3 width */}
          <div className="md:col-span-2 space-y-6">
            {/* Property details card */}
            <Card>
              <div className="relative h-64 w-full">
                <Image 
                  src={booking.property?.images?.[0] || '/images/placeholder-property.jpg'} 
                  alt={booking.property?.title || 'Property'}
                  fill
                  className="object-cover rounded-t-lg"
                />
              </div>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{booking.property?.title}</CardTitle>
                    <CardDescription className="flex items-center mt-1">
                      <MapPin className="h-4 w-4 mr-1" />
                      {booking.property?.location}
                    </CardDescription>
                  </div>
                  <Badge className={statusColors[booking.status] || 'bg-gray-100'}>
                    {booking.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Bedrooms</p>
                    <p className="font-medium">{booking.property?.bedrooms}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Bathrooms</p>
                    <p className="font-medium">{booking.property?.bathrooms}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Area</p>
                    <p className="font-medium">{booking.property?.area} m²</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Type</p>
                    <p className="font-medium capitalize">{booking.property?.type}</p>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Application Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Start Date</p>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                          <p>{new Date(booking.startDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Duration</p>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                          <p>{booking.duration} {booking.duration === 1 ? 'month' : 'months'}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Monthly Rent</p>
                        <p className="font-medium">${booking.property?.price}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Value</p>
                        <p className="font-medium">${booking.property?.price * booking.duration}</p>
                      </div>
                    </div>
                  </div>
                  
                  {booking.message && (
                    <div>
                      <h3 className="font-semibold mb-2">Your Message</h3>
                      <p className="text-sm bg-gray-50 p-3 rounded-md border border-gray-100">
                        {booking.message}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => router.push(`/properties/${booking.property?._id}`)}>
                  View Property
                </Button>
                
                {booking.status === 'pending' && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" disabled={cancelLoading}>
                        {cancelLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Cancel Application
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Cancel Application?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will cancel your rental application. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>No, keep it</AlertDialogCancel>
                        <AlertDialogAction onClick={cancelBooking}>
                          Yes, cancel application
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </CardFooter>
            </Card>
            
            {/* Message landlord card */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Landlord</CardTitle>
                <CardDescription>
                  Send a message to the landlord about this property
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea 
                  placeholder="Type your message here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  className="mb-4"
                />
                <Button 
                  onClick={sendMessage} 
                  disabled={!message.trim() || sendingMessage}
                  className="w-full"
                >
                  {sendingMessage && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Send Message
                </Button>
              </CardContent>
            </Card>
          </div>
          
          {/* Sidebar - 1/3 width */}
          <div className="space-y-6">
            {/* Landlord info card */}
            <Card>
              <CardHeader>
                <CardTitle>Landlord Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center mb-4">
                  <Avatar className="h-12 w-12 mr-4">
                    <AvatarImage src={booking.landlordId?.avatar || ''} alt={booking.landlordId?.name || 'Landlord'} />
                    <AvatarFallback>{booking.landlordId?.name?.charAt(0) || 'L'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">{booking.landlordId?.name}</h3>
                    <p className="text-sm text-muted-foreground">Landlord</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                    <p className="text-sm">{booking.landlordId?.email}</p>
                  </div>
                  {booking.landlordId?.phone && (
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                      <p className="text-sm">{booking.landlordId?.phone}</p>
                    </div>
                  )}
                </div>
                
                <div className="mt-4">
                  <Link href={`/dashboard/tenant/messages?userId=${booking.landlordId?._id}`}>
                    <Button variant="outline" className="w-full">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Message History
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
            
            {/* Status timeline card */}
            <Card>
              <CardHeader>
                <CardTitle>Application Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="relative border-l border-gray-200 ml-3">
                  <li className="mb-6 ml-6">
                    <span className="absolute flex items-center justify-center w-6 h-6 bg-green-100 rounded-full -left-3 ring-8 ring-white">
                      <Check className="w-3 h-3 text-green-800" />
                    </span>
                    <h3 className="font-semibold">Application Submitted</h3>
                    <p className="text-sm text-muted-foreground">
                      {new Date(booking.createdAt).toLocaleDateString()} at {new Date(booking.createdAt).toLocaleTimeString()}
                    </p>
                  </li>
                  
                  {booking.status !== 'pending' && (
                    <li className="mb-6 ml-6">
                      <span className={`absolute flex items-center justify-center w-6 h-6 rounded-full -left-3 ring-8 ring-white ${
                        booking.status === 'approved' ? 'bg-green-100' : 
                        booking.status === 'rejected' ? 'bg-red-100' : 'bg-gray-100'
                      }`}>
                        {booking.status === 'approved' ? (
                          <Check className="w-3 h-3 text-green-800" />
                        ) : booking.status === 'rejected' ? (
                          <X className="w-3 h-3 text-red-800" />
                        ) : (
                          <X className="w-3 h-3 text-gray-800" />
                        )}
                      </span>
                      <h3 className="font-semibold">
                        {booking.status === 'approved' ? 'Application Approved' : 
                         booking.status === 'rejected' ? 'Application Rejected' : 
                         'Application Cancelled'}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(booking.updatedAt).toLocaleDateString()} at {new Date(booking.updatedAt).toLocaleTimeString()}
                      </p>
                    </li>
                  )}
                  
                  {booking.status === 'pending' && (
                    <li className="ml-6">
                      <span className="absolute flex items-center justify-center w-6 h-6 bg-yellow-100 rounded-full -left-3 ring-8 ring-white">
                        <Clock className="w-3 h-3 text-yellow-800" />
                      </span>
                      <h3 className="font-semibold">Awaiting Response</h3>
                      <p className="text-sm text-muted-foreground">
                        The landlord is reviewing your application
                      </p>
                    </li>
                  )}
                </ol>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <AlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-medium mb-2">Application Not Found</h3>
          <p className="text-muted-foreground mb-6">
            The application you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <Button onClick={() => router.push('/dashboard/tenant/applications')}>
            View All Applications
          </Button>
        </div>
      )}
    </div>
  )
}

// Avatar component
function Avatar({ className, children }: { className?: string, children: React.ReactNode }) {
  return (
    <div className={`relative inline-flex items-center justify-center overflow-hidden bg-gray-100 rounded-full ${className}`}>
      {children}
    </div>
  )
}

function AvatarImage({ src, alt }: { src: string, alt: string }) {
  return src ? (
    <Image
      src={src}
      alt={alt}
      fill
      className="object-cover"
    />
  ) : null
}

function AvatarFallback({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-600 font-medium text-lg">
      {children}
    </div>
  )
}

function Check({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
} 