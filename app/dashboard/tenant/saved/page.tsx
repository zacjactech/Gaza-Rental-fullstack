"use client"

import { useState, useEffect } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { translations } from '@/translations'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useRouter } from 'next/navigation'
import { useUser } from '@/contexts/UserContext'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight, Heart, AlertCircle, Trash2 } from 'lucide-react'
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

export default function SavedPropertiesPage() {
  const { language } = useLanguage()
  const { user } = useUser()
  const t = translations[language]
  const router = useRouter()
  const [favorites, setFavorites] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [removingId, setRemovingId] = useState<string | null>(null)

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
        setLoading(false)
      }
    }

    fetchFavorites()
  }, [])

  // Remove property from favorites
  const removeFromFavorites = async (propertyId: string) => {
    try {
      setRemovingId(propertyId)
      const response = await fetch(`/api/favorites?propertyId=${propertyId}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        throw new Error('Failed to remove from favorites')
      }
      
      // Update the UI by removing the property
      setFavorites(favorites.filter(property => property._id !== propertyId))
    } catch (error) {
      console.error('Error removing from favorites:', error)
      setError('Failed to remove property from favorites')
    } finally {
      setRemovingId(null)
    }
  }

  if (!user) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-bold mb-4">Please log in to view your saved properties</h2>
        <Button onClick={() => router.push('/login')}>
          Go to Login
        </Button>
      </div>
    )
  }

  // Property card component
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
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 text-xs text-red-600 border-red-200 hover:bg-red-50"
                disabled={removingId === property._id}
              >
                {removingId === property._id ? 
                  <Skeleton className="h-4 w-4" /> : 
                  <Trash2 className="h-4 w-4" />
                }
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remove from favorites?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will remove this property from your saved list. You can always add it back later.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => removeFromFavorites(property._id)}>
                  Remove
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardFooter>
      </Card>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t.savedProperties || 'Saved Properties'}</h1>
          <p className="text-muted-foreground">{t.manageSavedProperties || 'View and manage your saved properties'}</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button onClick={() => router.push('/browse')}>
            Browse More Properties
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6 flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
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
          {favorites.map(property => (
            <PropertyCard key={property._id} property={property} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <Heart className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-medium mb-2">No Saved Properties</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            You haven't saved any properties to your favorites yet. Browse properties and click the heart icon to save them for later.
          </p>
          <Button onClick={() => router.push('/browse')}>
            Browse Properties
          </Button>
        </div>
      )}
    </div>
  )
} 