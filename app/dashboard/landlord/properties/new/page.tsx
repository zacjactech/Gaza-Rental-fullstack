"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { 
  ArrowLeft, 
  Building, 
  MapPin, 
  Home, 
  Bed, 
  Bath, 
  DollarSign, 
  Upload,
  Check,
  Info
} from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"
import { translations } from "@/translations"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"

// Form schema
const formSchema = z.object({
  title: z.string().min(5, {
    message: "Title must be at least 5 characters.",
  }),
  description: z.string().min(30, {
    message: "Description must be at least 30 characters.",
  }),
  propertyType: z.string({
    required_error: "Please select a property type.",
  }),
  price: z.coerce.number().min(10000, {
    message: "Price must be at least 10,000 TZS.",
  }),
  bedrooms: z.coerce.number().min(0),
  bathrooms: z.coerce.number().min(0),
  size: z.coerce.number().min(0),
  address: z.string().min(5, {
    message: "Address must be at least 5 characters.",
  }),
  city: z.string({
    required_error: "Please select a city.",
  }),
  neighborhood: z.string().optional(),
  amenities: z.array(z.string()).optional(),
  available: z.boolean().default(true),
  furnished: z.boolean().default(false)
})

const amenitiesList = [
  { id: "wifi", label: "WiFi" },
  { id: "parking", label: "Parking" },
  { id: "security", label: "Security" },
  { id: "gym", label: "Gym" },
  { id: "pool", label: "Swimming Pool" },
  { id: "aircon", label: "Air Conditioning" },
  { id: "balcony", label: "Balcony" },
  { id: "garden", label: "Garden" },
  { id: "pets", label: "Pets Allowed" },
  { id: "elevator", label: "Elevator" },
  { id: "laundry", label: "Laundry Facilities" },
]

export default function AddPropertyPage() {
  const router = useRouter()
  const { language } = useLanguage()
  const t = translations[language]
  const [activeTab, setActiveTab] = useState("details")
  const [photos, setPhotos] = useState<string[]>([])
  const [photoUploading, setPhotoUploading] = useState(false)
  
  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      price: 0,
      bedrooms: 1,
      bathrooms: 1,
      size: 0,
      address: "",
      neighborhood: "",
      amenities: [],
      available: true,
      furnished: false
    },
  })

  // Submit handler
  function onSubmit(values: z.infer<typeof formSchema>) {
    if (photos.length === 0) {
      toast({
        title: "Error",
        description: "Please upload at least one photo of your property.",
        variant: "destructive"
      })
      setActiveTab("photos")
      return
    }
    
    // Create the property data object
    const propertyData = {
      ...values,
      images: photos,
    }
    
    // Submit to API
    fetch('/api/properties', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(propertyData),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to create property');
        }
        return response.json();
      })
      .then(() => {
        toast({
          title: "Success",
          description: "Your property has been added successfully!",
        });
        router.push("/dashboard/landlord/properties");
      })
      .catch(error => {
        toast({
          title: "Error",
          description: error.message || "Failed to add property. Please try again.",
          variant: "destructive"
        });
      });
  }
  
  // Handle photo upload
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setPhotoUploading(true);
    try {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append('images', files[i]);
      }

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to upload images');
      }

      const data = await response.json();
      setPhotos([...photos, ...data.urls]);
    } catch (err) {
      toast({
        title: "Error",
        description: handleError(err),
        variant: "destructive"
      });
    } finally {
      setPhotoUploading(false);
    }
  };

  const handleRemovePhoto = (index: number) => {
    const newPhotos = [...photos];
    newPhotos.splice(index, 1);
    setPhotos(newPhotos);
  };
  
  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Add New Property</h1>
          <p className="text-muted-foreground">Create a new property listing to rent out.</p>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="details">Property Details</TabsTrigger>
          <TabsTrigger value="location">Location</TabsTrigger>
          <TabsTrigger value="photos">Photos & Amenities</TabsTrigger>
        </TabsList>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <TabsContent value="details" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>Provide the basic details of your property.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Property Title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Modern Apartment in Dar es Salaam" {...field} />
                        </FormControl>
                        <FormDescription>
                          A clear and catchy title will attract more tenants.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe your property in detail..."
                            rows={5}
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Highlight key features and benefits of your property.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="propertyType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Property Type</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select property type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="apartment">Apartment</SelectItem>
                              <SelectItem value="house">House</SelectItem>
                              <SelectItem value="villa">Villa</SelectItem>
                              <SelectItem value="studio">Studio</SelectItem>
                              <SelectItem value="duplex">Duplex</SelectItem>
                              <SelectItem value="penthouse">Penthouse</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Monthly Rent (TZS)</FormLabel>
                          <FormControl>
                            <div className="flex items-center">
                              <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                              <Input type="number" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="bedrooms"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bedrooms</FormLabel>
                          <FormControl>
                            <div className="flex items-center">
                              <Bed className="h-4 w-4 mr-2 text-muted-foreground" />
                              <Input type="number" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="bathrooms"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bathrooms</FormLabel>
                          <FormControl>
                            <div className="flex items-center">
                              <Bath className="h-4 w-4 mr-2 text-muted-foreground" />
                              <Input type="number" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="size"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Size (m²)</FormLabel>
                          <FormControl>
                            <div className="flex items-center">
                              <Home className="h-4 w-4 mr-2 text-muted-foreground" />
                              <Input type="number" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="flex flex-col md:flex-row gap-4">
                    <FormField
                      control={form.control}
                      name="available"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Available Now</FormLabel>
                            <FormDescription>
                              This property is available for immediate occupancy.
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="furnished"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Furnished</FormLabel>
                            <FormDescription>
                              This property comes with furniture and appliances.
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
              
              <div className="flex justify-end">
                <Button 
                  type="button" 
                  onClick={() => setActiveTab("location")}
                >
                  Next: Location
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="location" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Location Details</CardTitle>
                  <CardDescription>Where is your property located?</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Street Address</FormLabel>
                        <FormControl>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                            <Input placeholder="e.g. 123 Nyerere Road" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select city" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="dar-es-salaam">Dar es Salaam</SelectItem>
                              <SelectItem value="arusha">Arusha</SelectItem>
                              <SelectItem value="mwanza">Mwanza</SelectItem>
                              <SelectItem value="dodoma">Dodoma</SelectItem>
                              <SelectItem value="zanzibar">Zanzibar</SelectItem>
                              <SelectItem value="tanga">Tanga</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="neighborhood"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Neighborhood</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Mikocheni" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="border rounded-md p-4 bg-secondary/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Info className="h-4 w-4 text-primary" />
                      <p className="text-sm font-medium">Map Location</p>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      You will be able to pin your property&apos;s exact location on the map after submission.
                    </p>
                    <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center">
                      <p className="text-muted-foreground">Map preview will be available after submission</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="flex justify-between">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setActiveTab("details")}
                >
                  Back: Details
                </Button>
                <Button 
                  type="button" 
                  onClick={() => setActiveTab("photos")}
                >
                  Next: Photos & Amenities
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="photos" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Photos</CardTitle>
                  <CardDescription>Upload photos of your property (at least one is required).</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {photos.map((photo, index) => (
                      <div key={index} className="relative aspect-square rounded-md overflow-hidden group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={photo}
                          alt={`Property photo ${index + 1}`}
                          className="object-cover w-full h-full"
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleRemovePhoto(index)}
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                    
                    <Button
                      type="button"
                      variant="outline"
                      className="aspect-square h-full flex flex-col items-center justify-center gap-2 border-dashed"
                      onClick={() => document.getElementById('photo-upload')?.click()}
                      disabled={photoUploading}
                    >
                      {photoUploading ? (
                        <div className="animate-pulse">Uploading...</div>
                      ) : (
                        <>
                          <Upload className="h-6 w-6" />
                          <span>Upload Photo</span>
                        </>
                      )}
                    </Button>
                  </div>
                  
                  {photos.length === 0 && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Please upload at least one photo of your property.
                    </p>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Amenities</CardTitle>
                  <CardDescription>Select all amenities available in your property.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="amenities"
                    render={({ field }) => (
                      <FormItem>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {amenitiesList.map((amenity) => (
                            <FormItem
                              key={amenity.id}
                              className="flex items-center space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(amenity.id)}
                                  onCheckedChange={(checked) => {
                                    const currentValue = field.value || []
                                    const updatedValue = checked
                                      ? [...currentValue, amenity.id]
                                      : currentValue.filter((value) => value !== amenity.id)
                                    field.onChange(updatedValue)
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal cursor-pointer">
                                {amenity.label}
                              </FormLabel>
                            </FormItem>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
              
              <div className="flex justify-between">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setActiveTab("location")}
                >
                  Back: Location
                </Button>
                <Button type="submit">Submit Property Listing</Button>
              </div>
            </TabsContent>
          </form>
        </Form>
      </Tabs>
    </div>
  )
} 