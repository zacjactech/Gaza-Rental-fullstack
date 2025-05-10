"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, Save, Trash, Home, MapPin, 
  DollarSign, Bed, Bath, Square, 
  Image as ImageIcon, InfoIcon, CheckCircle 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/components/ui/use-toast";
import { Property } from "@/lib/models/property";
import { handleError } from "@/lib/utils";

// Types for our form data
interface PropertyFormData {
  title: string;
  description: string;
  location: string;
  price: number;
  status: string;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  features: string[];
  images: string[];
}

export default function EditPropertyPage() {
  const router = useRouter();
  const params = useParams();
  const propertyId = params.id as string;
  const { toast } = useToast();
  
  // State for form data
  const [formData, setFormData] = useState<PropertyFormData>({
    title: "",
    description: "",
    location: "",
    price: 0,
    status: "active",
    propertyType: "apartment",
    bedrooms: 1,
    bathrooms: 1,
    area: 0,
    features: [],
    images: []
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  
  // Fetch property data
  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const response = await fetch(`/api/properties/${propertyId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch property');
        }
        const property = await response.json();
        
        setFormData({
          title: property.title || "",
          description: property.description || "",
          location: property.location || "",
          price: property.price || 0,
          status: property.status || "active",
          propertyType: property.type || "apartment",
          bedrooms: property.bedrooms || 1,
          bathrooms: property.bathrooms || 1,
          area: property.area || 0,
          features: property.amenities || [],
          images: property.images || []
        });
      } catch (err) {
        toast({
          title: "Error",
          description: handleError(err),
          variant: "destructive"
        });
        router.push('/dashboard/landlord/properties');
      }
    };

    fetchProperty();
  }, [propertyId, router, toast]);
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle number input changes
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0
    }));
  };
  
  // Toggle features
  const toggleFeature = (feature: string) => {
    setFormData(prev => {
      const features = [...prev.features];
      if (features.includes(feature)) {
        return { ...prev, features: features.filter(f => f !== feature) };
      } else {
        return { ...prev, features: [...features, feature] };
      }
    });
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/properties/${propertyId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          location: formData.location,
          price: formData.price,
          status: formData.status,
          type: formData.propertyType,
          bedrooms: formData.bedrooms,
          bathrooms: formData.bathrooms,
          area: formData.area,
          amenities: formData.features,
          images: formData.images
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update property');
      }
      
      toast({
        title: "Property updated",
        description: "Your property has been successfully updated.",
      });
      
      router.push('/dashboard/landlord/properties');
    } catch (error) {
      toast({
        title: "Error",
        description: handleError(error),
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Feature options
  const featureOptions = [
    { id: 'parking', label: 'Parking', icon: '🅿️' },
    { id: 'security', label: 'Security', icon: '🔒' },
    { id: 'pool', label: 'Swimming Pool', icon: '🏊‍♂️' },
    { id: 'gym', label: 'Gym', icon: '💪' },
    { id: 'internet', label: 'Internet', icon: '📶' },
    { id: 'furnished', label: 'Furnished', icon: '🛋️' },
    { id: 'aircon', label: 'Air Conditioning', icon: '❄️' },
    { id: 'garden', label: 'Garden', icon: '🌳' },
    { id: 'balcony', label: 'Balcony', icon: '🏛️' },
    { id: 'elevator', label: 'Elevator', icon: '🛗' }
  ];
  
  return (
    <div className="py-6 lg:py-8 px-4 md:px-6 lg:px-8">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => router.push('/dashboard/landlord/properties')}
              className="mr-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Properties
            </Button>
            <div>
              <h1 className="font-bold tracking-tight">Edit Property</h1>
              <p className="text-muted-foreground text-sm">Update property details and information</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push('/dashboard/landlord/properties')}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="animate-spin mr-2">⏳</span> Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 w-full max-w-md">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="images">Images</TabsTrigger>
          </TabsList>
          
          <Card className="mt-4">
            <TabsContent value="basic" className="p-0">
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Update the essential details of your property
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Property Title</Label>
                  <div className="relative">
                    <Home className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="title"
                      name="title"
                      placeholder="e.g. Modern Apartment in Dar es Salaam"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Describe your property in detail..."
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={5}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="location"
                      name="location"
                      placeholder="e.g. Mikocheni, Dar es Salaam"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="price">Monthly Rent (TZS)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      placeholder="e.g. 450000"
                      value={formData.price}
                      onChange={handleNumberChange}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="status">Listing Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </TabsContent>
            
            <TabsContent value="details" className="p-0">
              <CardHeader>
                <CardTitle>Property Details</CardTitle>
                <CardDescription>
                  Update specifications and features of your property
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="propertyType">Property Type</Label>
                    <Select
                      value={formData.propertyType}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, propertyType: value }))}
                    >
                      <SelectTrigger id="propertyType">
                        <SelectValue placeholder="Select property type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="apartment">Apartment</SelectItem>
                        <SelectItem value="house">House</SelectItem>
                        <SelectItem value="villa">Villa</SelectItem>
                        <SelectItem value="studio">Studio</SelectItem>
                        <SelectItem value="office">Office Space</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="area">Area (sq.m)</Label>
                    <div className="relative">
                      <Square className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="area"
                        name="area"
                        type="number"
                        placeholder="e.g. 85"
                        value={formData.area}
                        onChange={handleNumberChange}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bedrooms">Bedrooms</Label>
                    <div className="relative">
                      <Bed className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="bedrooms"
                        name="bedrooms"
                        type="number"
                        placeholder="e.g. 2"
                        value={formData.bedrooms}
                        onChange={handleNumberChange}
                        className="pl-10"
                        min={0}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bathrooms">Bathrooms</Label>
                    <div className="relative">
                      <Bath className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="bathrooms"
                        name="bathrooms"
                        type="number"
                        placeholder="e.g. 1"
                        value={formData.bathrooms}
                        onChange={handleNumberChange}
                        className="pl-10"
                        min={0}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <Label>Features & Amenities</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                    {featureOptions.map((feature) => (
                      <div
                        key={feature.id}
                        className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                          formData.features.includes(feature.id)
                            ? 'bg-primary/10 border-primary'
                            : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                        onClick={() => toggleFeature(feature.id)}
                      >
                        <div className="mr-2">{feature.icon}</div>
                        <div className="text-sm">{feature.label}</div>
                        {formData.features.includes(feature.id) && (
                          <CheckCircle className="h-4 w-4 text-primary ml-auto" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </TabsContent>
            
            <TabsContent value="images" className="p-0">
              <CardHeader>
                <CardTitle>Property Images</CardTitle>
                <CardDescription>
                  Upload and manage images of your property
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative rounded-lg overflow-hidden h-48 group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={image}
                        alt={`Property image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              images: prev.images.filter((_, i) => i !== index)
                            }));
                          }}
                        >
                          <Trash className="h-4 w-4 mr-1" /> Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg h-48 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 cursor-pointer hover:border-primary hover:text-primary transition-colors p-4">
                    <ImageIcon className="h-8 w-8 mb-2" />
                    <p className="text-sm font-medium">Upload New Image</p>
                    <p className="text-xs text-center mt-1">Drag and drop or click to browse</p>
                  </div>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-sm flex items-start">
                  <InfoIcon className="h-4 w-4 text-blue-500 mr-2 mt-0.5" />
                  <div>
                    <p className="text-gray-600 dark:text-gray-300">
                      For best results, use images that are at least 1024x768 pixels. Maximum file size 5MB.
                    </p>
                  </div>
                </div>
              </CardContent>
            </TabsContent>
          </Card>
        </Tabs>
      </div>
    </div>
  );
} 