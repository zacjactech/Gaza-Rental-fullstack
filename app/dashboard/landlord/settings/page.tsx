"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  User, 
  Bell, 
  Shield, 
  CreditCard, 
  Home, 
  LogOut, 
  Save,
  Camera,
  Edit,
  Trash,
  Check,
  X,
  Mail,
  Phone,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/translations";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";

export default function LandlordSettingsPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const t = translations[language];
  const { toast } = useToast();
  
  // Profile settings state
  const [profile, setProfile] = useState({
    name: "Ahmed Mohamed",
    email: "ahmed.mohamed@example.com",
    phone: "+255 123 456 789",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    bio: "Property manager with 5 years of experience in residential rentals in Dar es Salaam. I manage several properties in Mikocheni, Masaki, and Upanga areas.",
    location: "Dar es Salaam, Tanzania",
    languages: ["English", "Swahili"]
  });
  
  // Notification settings state
  const [notifications, setNotifications] = useState({
    emailApplications: true,
    emailMessages: true,
    emailPayments: true,
    pushApplications: true,
    pushMessages: true,
    pushPayments: false,
    marketingEmails: false
  });
  
  // Account settings state
  const [accountSettings, setAccountSettings] = useState({
    currency: "TZS",
    language: "en",
    twoFactorEnabled: false
  });
  
  // Property settings state
  const [propertySettings, setPropertySettings] = useState({
    autoApproveApplications: false,
    showContactInfo: true,
    allowMessages: true,
    defaultLeaseLength: "12",
    securityDepositMonths: "1",
    defaultAvailability: "immediate"
  });
  
  // Handle profile updates
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle notification toggle
  const handleNotificationToggle = (setting: string) => {
    setNotifications(prev => ({
      ...prev,
      [setting]: !prev[setting as keyof typeof prev]
    }));
  };
  
  // Handle account settings change
  const handleAccountSettingChange = (setting: string, value: string | boolean) => {
    setAccountSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };
  
  // Handle property settings change
  const handlePropertySettingChange = (setting: string, value: string | boolean) => {
    setPropertySettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };
  
  // Save settings
  const saveSettings = () => {
    toast({
      title: "Settings saved",
      description: "Your settings have been updated successfully.",
    });
  };
  
  // Upload avatar
  const uploadAvatar = () => {
    // Placeholder for avatar upload functionality
    console.log("Upload avatar");
  };
  
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Account Settings</h1>
          <p className="text-muted-foreground">
            Manage your profile and preferences
          </p>
        </div>
      </div>
      
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full md:w-auto grid-cols-2 md:grid-cols-4 gap-2">
          <TabsTrigger value="profile" className="flex items-center">
            <User className="h-4 w-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="account" className="flex items-center">
            <Shield className="h-4 w-4 mr-2" />
            Account
          </TabsTrigger>
          <TabsTrigger value="properties" className="flex items-center">
            <Home className="h-4 w-4 mr-2" />
            Properties
          </TabsTrigger>
        </TabsList>
        
        {/* Profile Tab */}
        <TabsContent value="profile">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Update your personal details and public profile
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={profile.avatar} alt={profile.name} />
                      <AvatarFallback>{profile.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <Button 
                      size="icon" 
                      variant="outline" 
                      className="absolute bottom-0 right-0 rounded-full h-8 w-8 bg-background"
                      onClick={uploadAvatar}
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="text-center">
                    <p className="font-medium">{profile.name}</p>
                    <p className="text-sm text-muted-foreground">{profile.location}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={profile.name}
                    onChange={handleProfileChange}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={profile.email}
                        onChange={handleProfileChange}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        name="phone"
                        value={profile.phone}
                        onChange={handleProfileChange}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    name="location"
                    value={profile.location}
                    onChange={handleProfileChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={profile.bio}
                    onChange={handleProfileChange}
                    rows={4}
                    placeholder="Tell potential tenants about yourself..."
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end border-t pt-4">
                <Button onClick={saveSettings}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Public Profile</CardTitle>
                <CardDescription>
                  Manage how your profile appears to potential tenants
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Languages Spoken</Label>
                  <div className="flex flex-wrap gap-2">
                    {profile.languages.map((lang, index) => (
                      <div key={index} className="flex items-center bg-secondary rounded-full px-3 py-1 text-sm">
                        {lang}
                        <Button variant="ghost" size="icon" className="h-5 w-5 ml-1">
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    <Button variant="outline" size="sm" className="rounded-full">
                      <Plus className="h-4 w-4 mr-1" />
                      Add Language
                    </Button>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Label>Public Contact Information</Label>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4" />
                      <span>Show email address</span>
                    </div>
                    <Switch checked={true} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4" />
                      <span>Show phone number</span>
                    </div>
                    <Switch checked={false} />
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Label>Profile Verification</Label>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4" />
                        <span>Email verified</span>
                      </div>
                      <Badge variant="success" className="flex items-center">
                        <Check className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4" />
                        <span>Phone verified</span>
                      </div>
                      <Button variant="outline" size="sm">
                        Verify Now
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Shield className="h-4 w-4" />
                        <span>ID verification</span>
                      </div>
                      <Button variant="outline" size="sm">
                        Verify Now
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end border-t pt-4">
                <Button onClick={saveSettings}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Manage how and when you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Email Notifications</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="emailApplications" className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>New rental applications</span>
                    </Label>
                    <Switch 
                      id="emailApplications" 
                      checked={notifications.emailApplications}
                      onCheckedChange={() => handleNotificationToggle('emailApplications')}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="emailMessages" className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>New messages from tenants</span>
                    </Label>
                    <Switch 
                      id="emailMessages" 
                      checked={notifications.emailMessages}
                      onCheckedChange={() => handleNotificationToggle('emailMessages')}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="emailPayments" className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                      <span>Payment confirmations</span>
                    </Label>
                    <Switch 
                      id="emailPayments" 
                      checked={notifications.emailPayments}
                      onCheckedChange={() => handleNotificationToggle('emailPayments')}
                    />
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Push Notifications</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="pushApplications" className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>New rental applications</span>
                    </Label>
                    <Switch 
                      id="pushApplications" 
                      checked={notifications.pushApplications}
                      onCheckedChange={() => handleNotificationToggle('pushApplications')}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="pushMessages" className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>New messages from tenants</span>
                    </Label>
                    <Switch 
                      id="pushMessages" 
                      checked={notifications.pushMessages}
                      onCheckedChange={() => handleNotificationToggle('pushMessages')}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="pushPayments" className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                      <span>Payment confirmations</span>
                    </Label>
                    <Switch 
                      id="pushPayments" 
                      checked={notifications.pushPayments}
                      onCheckedChange={() => handleNotificationToggle('pushPayments')}
                    />
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Marketing Communications</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="marketingEmails" className="flex items-center gap-2">
                      <span>Product updates and offers</span>
                    </Label>
                    <Switch 
                      id="marketingEmails" 
                      checked={notifications.marketingEmails}
                      onCheckedChange={() => handleNotificationToggle('marketingEmails')}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Receive updates about new features, tips for landlords, and special offers.
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-4">
              <Button variant="outline">Reset to Defaults</Button>
              <Button onClick={saveSettings}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Account Tab */}
        <TabsContent value="account">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>
                  Manage your account preferences and security
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select 
                    value={accountSettings.currency} 
                    onValueChange={(value) => handleAccountSettingChange('currency', value)}
                  >
                    <SelectTrigger id="currency">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TZS">Tanzanian Shilling (TZS)</SelectItem>
                      <SelectItem value="USD">US Dollar (USD)</SelectItem>
                      <SelectItem value="EUR">Euro (EUR)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select 
                    value={accountSettings.language} 
                    onValueChange={(value) => handleAccountSettingChange('language', value)}
                  >
                    <SelectTrigger id="language">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="sw">Swahili</SelectItem>
                      <SelectItem value="ar">Arabic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="twoFactorEnabled" className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <span>Two-factor authentication</span>
                    </Label>
                    <Switch 
                      id="twoFactorEnabled" 
                      checked={accountSettings.twoFactorEnabled}
                      onCheckedChange={(checked) => handleAccountSettingChange('twoFactorEnabled', checked)}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Add an extra layer of security to your account by requiring a verification code in addition to your password.
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end border-t pt-4">
                <Button onClick={saveSettings}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Password & Security</CardTitle>
                <CardDescription>
                  Update your password and manage security settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input id="currentPassword" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input id="newPassword" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input id="confirmPassword" type="password" />
                </div>
                
                <Button className="w-full">Update Password</Button>
                
                <Separator />
                
                <div className="pt-2">
                  <h3 className="text-lg font-medium mb-2">Account Actions</h3>
                  <div className="space-y-4">
                    <Button variant="outline" className="w-full flex items-center justify-start text-yellow-600 border-yellow-200">
                      <Shield className="h-4 w-4 mr-2" />
                      Download Personal Data
                    </Button>
                    <Button variant="outline" className="w-full flex items-center justify-start text-red-600 border-red-200">
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out from All Devices
                    </Button>
                    <Button variant="outline" className="w-full flex items-center justify-start text-red-600 border-red-200">
                      <Trash className="h-4 w-4 mr-2" />
                      Delete Account
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Properties Tab */}
        <TabsContent value="properties">
          <Card>
            <CardHeader>
              <CardTitle>Property Settings</CardTitle>
              <CardDescription>
                Configure default settings for your rental properties
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Application Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="autoApproveApplications" className="flex items-center gap-2">
                      <span>Auto-approve applications</span>
                    </Label>
                    <Switch 
                      id="autoApproveApplications" 
                      checked={propertySettings.autoApproveApplications}
                      onCheckedChange={(checked) => handlePropertySettingChange('autoApproveApplications', checked)}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Automatically approve applications that meet all your criteria. Not recommended for most landlords.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="defaultLeaseLength">Default Lease Length</Label>
                      <Select 
                        value={propertySettings.defaultLeaseLength} 
                        onValueChange={(value) => handlePropertySettingChange('defaultLeaseLength', value)}
                      >
                        <SelectTrigger id="defaultLeaseLength">
                          <SelectValue placeholder="Select lease length" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3">3 months</SelectItem>
                          <SelectItem value="6">6 months</SelectItem>
                          <SelectItem value="12">12 months</SelectItem>
                          <SelectItem value="24">24 months</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="securityDepositMonths">Security Deposit</Label>
                      <Select 
                        value={propertySettings.securityDepositMonths} 
                        onValueChange={(value) => handlePropertySettingChange('securityDepositMonths', value)}
                      >
                        <SelectTrigger id="securityDepositMonths">
                          <SelectValue placeholder="Select deposit amount" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">No deposit</SelectItem>
                          <SelectItem value="0.5">Half month&apos;s rent</SelectItem>
                          <SelectItem value="1">1 month&apos;s rent</SelectItem>
                          <SelectItem value="2">2 months&apos; rent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Contact & Communication</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="showContactInfo" className="flex items-center gap-2">
                      <span>Show contact information in listings</span>
                    </Label>
                    <Switch 
                      id="showContactInfo" 
                      checked={propertySettings.showContactInfo}
                      onCheckedChange={(checked) => handlePropertySettingChange('showContactInfo', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="allowMessages" className="flex items-center gap-2">
                      <span>Allow direct messages</span>
                    </Label>
                    <Switch 
                      id="allowMessages" 
                      checked={propertySettings.allowMessages}
                      onCheckedChange={(checked) => handlePropertySettingChange('allowMessages', checked)}
                    />
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Default Property Settings</h3>
                <div className="space-y-2">
                  <Label htmlFor="defaultAvailability">Default Availability</Label>
                  <Select 
                    value={propertySettings.defaultAvailability} 
                    onValueChange={(value) => handlePropertySettingChange('defaultAvailability', value)}
                  >
                    <SelectTrigger id="defaultAvailability">
                      <SelectValue placeholder="Select default availability" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Available Immediately</SelectItem>
                      <SelectItem value="1month">Available in 1 Month</SelectItem>
                      <SelectItem value="contact">Contact for Availability</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-4">
              <Button variant="outline">Reset to Defaults</Button>
              <Button onClick={saveSettings}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 