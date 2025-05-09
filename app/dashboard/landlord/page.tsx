"use client"

import { useState, useEffect } from "react"
import { 
  Home, 
  Users, 
  MessageSquare, 
  TrendingUp, 
  DollarSign,
  Calendar,
  Check,
  AlertCircle,
  PlusCircle,
  Cog,
  CreditCard,
  LifeBuoy
} from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"
import { translations } from "@/translations"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { useTranslations } from 'next-intl'
import { Property } from '@/lib/models/property'
import { Booking } from '@/lib/models/booking'
import { Message } from '@/lib/models/message'
import { handleError } from '@/lib/utils'
import Link from 'next/link'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'

interface StatCardProps {
  title: string
  value: string | number
  description: string
  icon: React.ReactNode
  trend?: "up" | "down" | "neutral"
  percentage?: number
}

const StatCard = ({ title, value, description, icon, trend, percentage }: StatCardProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
        {trend && percentage && (
          <div className="flex items-center mt-2">
            <span className={`text-xs ${trend === "up" ? "text-green-600" : trend === "down" ? "text-red-600" : "text-gray-500"}`}>
              {trend === "up" ? "+" : trend === "down" ? "-" : ""}
              {percentage}%
            </span>
            <TrendingUp className={`h-3 w-3 ml-1 ${trend === "up" ? "text-green-600" : trend === "down" ? "text-red-600" : "text-gray-500"}`} />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface DashboardStats {
  totalProperties: number;
  activeProperties: number;
  totalApplications: number;
  pendingApplications: number;
  totalMessages: number;
  unreadMessages: number;
}

export default function LandlordDashboardPage() {
  const { language } = useLanguage()
  const t = translations[language]
  const router = useRouter()
  const [properties, setProperties] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [activeProperties, setActiveProperties] = useState(0);
  const [inactiveProperties, setInactiveProperties] = useState(0);
  const [totalApplications, setTotalApplications] = useState(0);
  const [occupancyRate, setOccupancyRate] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalProperties: 0,
    activeProperties: 0,
    totalApplications: 0,
    pendingApplications: 0,
    totalMessages: 0,
    unreadMessages: 0
  });
  const [recentProperties, setRecentProperties] = useState<Property[]>([]);
  const [recentApplications, setRecentApplications] = useState<Booking[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch properties
        const propertiesResponse = await fetch('/api/properties/landlord');
        if (!propertiesResponse.ok) {
          throw new Error('Failed to fetch properties');
        }
        const propertiesData = await propertiesResponse.json();
        
        // Fetch bookings (applications)
        const bookingsResponse = await fetch('/api/bookings/landlord');
        if (!bookingsResponse.ok) {
          throw new Error('Failed to fetch bookings');
        }
        const bookingsData = await bookingsResponse.json();
        
        // Fetch messages
        const messagesResponse = await fetch('/api/messages');
        if (!messagesResponse.ok) {
          throw new Error('Failed to fetch messages');
        }
        const messagesData = await messagesResponse.json();
        
        // Set state with fetched data
        setProperties(propertiesData.properties || propertiesData);
        setApplications(bookingsData);
        setMessages(messagesData);
        
        // Calculate stats
        const active = (propertiesData.properties || propertiesData).filter((p: any) => p.isAvailable).length;
        const inactive = (propertiesData.properties || propertiesData).length - active;
        
        setActiveProperties(active);
        setInactiveProperties(inactive);
        setTotalApplications(bookingsData.length);
        setOccupancyRate((propertiesData.properties || propertiesData).length > 0 ? Math.round((active / (propertiesData.properties || propertiesData).length) * 100) : 0);
        setUnreadMessages(messagesData.filter((m: any) => !m.isRead).length);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err instanceof Error ? err.message : 'An error occurred while fetching dashboard data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  // Show loading state
  if (isLoading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-screen">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  // Show error state
  if (error) {
    return (
      <div className="p-6 flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-2">Error</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Landlord Dashboard</h1>
          <p className="text-muted-foreground">Manage your properties and view insights.</p>
        </div>
        <Button className="mt-4 md:mt-0" onClick={() => router.push('/dashboard/landlord/properties/new')}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Property
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard
          title="Properties"
          value={activeProperties + inactiveProperties}
          description={`${activeProperties} active, ${inactiveProperties} inactive`}
          icon={<Home className="h-4 w-4" />}
        />
        <StatCard
          title="Applications"
          value={totalApplications}
          description="Total applications received"
          icon={<Users className="h-4 w-4" />}
        />
        <StatCard
          title="Messages"
          value={messages.length}
          description={`${unreadMessages} unread messages`}
          icon={<MessageSquare className="h-4 w-4" />}
        />
        <StatCard
          title="Occupancy Rate"
          value={`${occupancyRate}%`}
          description="Of your properties are active"
          icon={<TrendingUp className="h-4 w-4" />}
        />
      </div>

      <Tabs defaultValue="properties" className="mb-6">
        <TabsList>
          <TabsTrigger value="properties">Properties</TabsTrigger>
          <TabsTrigger value="applications">Recent Applications</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
        </TabsList>
        <TabsContent value="properties" className="space-y-4 mt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {properties.length === 0 ? (
              <div className="col-span-3 text-center py-10">
                <h3 className="text-lg font-semibold mb-2">No properties yet</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">Add your first property to get started.</p>
                <Button onClick={() => router.push('/dashboard/landlord/properties/new')}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add New Property
                </Button>
              </div>
            ) : (
              properties.map((property) => (
                <Card key={property.id || property._id} className="overflow-hidden">
                  <div className="relative h-48">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={property.image} 
                      alt={property.title}
                      className="object-cover w-full h-full"
                    />
                    <div className="absolute top-2 right-2">
                      <Badge variant={property.isAvailable ? "success" : "destructive"}>
                        {property.isAvailable ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                      <p className="text-white font-medium">{property.price.toLocaleString()} TZS/month</p>
                    </div>
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{property.title}</CardTitle>
                    <CardDescription>{property.location}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex justify-between items-center">
                      <p className="text-sm">
                        {applications.filter(app => app.property.id === property.id || app.property._id === property._id).length} applications
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => router.push(`/dashboard/landlord/properties/${property.id || property._id}`)}
                      >
                        Manage
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
        <TabsContent value="applications" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Applications</CardTitle>
              <CardDescription>Review your latest rental applications</CardDescription>
            </CardHeader>
            <CardContent>
              {applications.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">No applications received yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {applications.slice(0, 5).map((application) => (
                    <div key={`application-${application.id}`} className="flex items-center space-x-4">
                      <div className="w-20 h-20 rounded-md overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={application.property.image} 
                          alt={application.property.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{application.tenant.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{application.property.title}</p>
                        <p className="text-xs text-muted-foreground">
                          Applied on {new Date(application.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant={
                        application.status === "approved" ? "success" : 
                        application.status === "rejected" ? "destructive" : 
                        "outline"
                      }>
                        {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
              
              {applications.length > 0 && (
                <div className="mt-4 text-center">
                  <Button 
                    variant="outline" 
                    onClick={() => router.push('/dashboard/landlord/applications')}
                  >
                    View All Applications
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="messages" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Messages</CardTitle>
              <CardDescription>Stay in touch with potential tenants</CardDescription>
            </CardHeader>
            <CardContent>
              {messages.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">No messages received yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.slice(0, 5).map((message) => (
                    <div key={`message-${message.id}`} className="flex items-start space-x-4">
                      <div className={`w-2 h-2 mt-2 rounded-full ${message.isRead ? 'bg-gray-300' : 'bg-blue-500'}`} />
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <p className="text-sm font-medium">{message.sender.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(message.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                        <p className="text-sm truncate">{message.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {messages.length > 0 && (
                <div className="mt-4 text-center">
                  <Button 
                    variant="outline" 
                    onClick={() => router.push('/dashboard/landlord/messages')}
                  >
                    View All Messages
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6">
              <p className="text-muted-foreground">No upcoming appointments scheduled.</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => router.push('/dashboard/landlord/calendar')}
              >
                <Calendar className="mr-2 h-4 w-4" />
                View Calendar
              </Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6">
              <p className="text-muted-foreground">Revenue data not available. Connect your payment methods to track revenue.</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => router.push('/dashboard/landlord/settings')}
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Payment Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Account Settings Section */}
      <div className="mt-8">
        <h2 className="text-xl font-bold tracking-tight mb-4">Account Management</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Profile Settings</CardTitle>
              <CardDescription>Manage your account and preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Update your profile information, notification preferences, and security settings.
              </p>
              <Button 
                variant="outline" 
                onClick={() => router.push('/dashboard/landlord/settings')}
                className="w-full"
              >
                <Cog className="mr-2 h-4 w-4" />
                Go to Settings
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Billing & Subscription</CardTitle>
              <CardDescription>Manage your payment details</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Review your subscription plan, payment history, and update payment methods.
              </p>
              <Button 
                variant="outline"
                className="w-full"
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Manage Billing
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Help & Support</CardTitle>
              <CardDescription>Get assistance when you need it</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Access our help documentation, tutorials, and contact support if needed.
              </p>
              <Button 
                variant="outline"
                className="w-full"
              >
                <LifeBuoy className="mr-2 h-4 w-4" />
                Get Help
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 