"use client"

import { useState, useEffect, useRef } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { translations } from '@/translations'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useRouter } from 'next/navigation'
import { useUser } from '@/contexts/UserContext'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { AlertCircle, Check, Loader2, Upload } from 'lucide-react'
import { useForm } from 'react-hook-form'

export default function TenantSettingsPage() {
  const { language } = useLanguage()
  const { user, refreshUser } = useUser()
  const t = translations[language]
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [avatarLoading, setAvatarLoading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [userData, setUserData] = useState<any>(null)
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  })

  // Fetch user profile data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/users/me')
        if (!response.ok) {
          throw new Error('Failed to fetch user data')
        }
        const data = await response.json()
        setUserData(data)
        
        // Set form default values
        if (data) {
          // This would be handled by react-hook-form's reset method in a real implementation
          setEmailNotifications(data.preferences?.emailNotifications ?? true)
          setPushNotifications(data.preferences?.pushNotifications ?? true)
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
        setError('Failed to load user profile')
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchUserData()
    }
  }, [user])

  // Handle profile update
  const onProfileUpdate = async (data: any) => {
    try {
      setLoading(true)
      setError(null)
      setSuccess(null)
      
      const response = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: data.name,
          phone: data.phone
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to update profile')
      }
      
      setSuccess('Profile updated successfully')
      
      // Update local user data
      const updatedData = await response.json()
      setUserData(updatedData)
    } catch (error) {
      console.error('Error updating profile:', error)
      setError('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  // Handle avatar upload
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setAvatarLoading(true)
      setError(null)
      setSuccess(null)

      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
      if (!validTypes.includes(file.type)) {
        setError('Invalid file type. Only JPEG, PNG, GIF and WebP are allowed.')
        return
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024 // 5MB
      if (file.size > maxSize) {
        setError('File too large. Maximum size is 5MB.')
        return
      }

      // Create form data
      const formData = new FormData()
      formData.append('avatar', file)

      // Upload avatar
      const response = await fetch('/api/users/avatar', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to upload avatar')
      }

      const data = await response.json()
      
      // Update local user data with new avatar
      setUserData(prev => ({
        ...prev,
        avatar: data.avatar
      }))
      
      // Refresh user context data
      await refreshUser()
      
      setSuccess('Avatar updated successfully')
    } catch (error) {
      console.error('Error uploading avatar:', error)
      setError(error instanceof Error ? error.message : 'Failed to upload avatar')
    } finally {
      setAvatarLoading(false)
    }
  }

  // Handle password change
  const onPasswordChange = async (data: any) => {
    try {
      setLoading(true)
      setError(null)
      setSuccess(null)
      
      // Validate passwords match
      if (data.newPassword !== data.confirmPassword) {
        setError('New passwords do not match')
        return
      }
      
      const response = await fetch('/api/users/password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to change password')
      }
      
      setSuccess('Password changed successfully')
      
      // Clear password fields
      // In a real implementation, we would use form.reset() here
    } catch (error: any) {
      console.error('Error changing password:', error)
      setError(error.message || 'Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  // Handle notification preferences update
  const updateNotificationPreferences = async () => {
    try {
      setLoading(true)
      setError(null)
      setSuccess(null)
      
      const response = await fetch('/api/users/preferences', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          preferences: {
            emailNotifications,
            pushNotifications
          }
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to update notification preferences')
      }
      
      setSuccess('Notification preferences updated')
    } catch (error) {
      console.error('Error updating notification preferences:', error)
      setError('Failed to update notification preferences')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-bold mb-4">Please log in to access settings</h2>
        <Button onClick={() => router.push('/login')}>
          Go to Login
        </Button>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">{t.accountSettings || 'Account Settings'}</h1>
        <p className="text-muted-foreground">{t.manageYourAccount || 'Manage your account preferences and settings'}</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6 flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6 flex items-center gap-2">
          <Check className="h-4 w-4" />
          {success}
        </div>
      )}

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal information</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onProfileUpdate)} className="space-y-6">
                <div className="flex flex-col md:flex-row gap-4 items-start">
                  <div className="flex-shrink-0 relative group">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={userData?.avatar || ''} alt={userData?.name || 'User'} />
                      <AvatarFallback>{userData?.name?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                    {avatarLoading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full">
                        <Loader2 className="h-8 w-8 text-white animate-spin" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <h3 className="font-medium">{userData?.name || 'User'}</h3>
                    <p className="text-sm text-muted-foreground">{userData?.email || ''}</p>
                    <p className="text-sm text-muted-foreground">
                      Member since: {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'N/A'}
                    </p>
                    <div className="mt-2">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleAvatarUpload}
                        accept="image/jpeg,image/png,image/gif,image/webp"
                        className="hidden"
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        disabled={avatarLoading}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        {avatarLoading ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Upload className="mr-2 h-4 w-4" />
                        )}
                        Change Avatar
                      </Button>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input 
                      id="name" 
                      {...register('name', { required: 'Name is required' })}
                      defaultValue={userData?.name || ''}
                      placeholder="Your full name" 
                    />
                    {errors.name && (
                      <p className="text-sm text-red-500">{errors.name.message?.toString()}</p>
                    )}
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input 
                      id="email" 
                      type="email"
                      defaultValue={userData?.email || ''}
                      disabled
                      placeholder="Your email address" 
                    />
                    <p className="text-xs text-muted-foreground">
                      Contact support to change your email address
                    </p>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input 
                      id="phone" 
                      {...register('phone')}
                      defaultValue={userData?.phone || ''}
                      placeholder="Your phone number" 
                    />
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Password</CardTitle>
              <CardDescription>Change your password</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onPasswordChange)} className="space-y-6">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input 
                      id="currentPassword" 
                      type="password"
                      {...register('currentPassword', { required: 'Current password is required' })}
                      placeholder="Your current password" 
                    />
                    {errors.currentPassword && (
                      <p className="text-sm text-red-500">{errors.currentPassword.message?.toString()}</p>
                    )}
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input 
                      id="newPassword" 
                      type="password"
                      {...register('newPassword', { 
                        required: 'New password is required',
                        minLength: {
                          value: 8,
                          message: 'Password must be at least 8 characters'
                        }
                      })}
                      placeholder="New password" 
                    />
                    {errors.newPassword && (
                      <p className="text-sm text-red-500">{errors.newPassword.message?.toString()}</p>
                    )}
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input 
                      id="confirmPassword" 
                      type="password"
                      {...register('confirmPassword', { 
                        required: 'Please confirm your password'
                      })}
                      placeholder="Confirm new password" 
                    />
                    {errors.confirmPassword && (
                      <p className="text-sm text-red-500">{errors.confirmPassword.message?.toString()}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Change Password
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Manage how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => { e.preventDefault(); updateNotificationPreferences(); }} className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="emailNotifications" className="text-base">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                    </div>
                    <Switch 
                      id="emailNotifications" 
                      checked={emailNotifications} 
                      onCheckedChange={setEmailNotifications} 
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="pushNotifications" className="text-base">Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive in-app notifications</p>
                    </div>
                    <Switch 
                      id="pushNotifications" 
                      checked={pushNotifications} 
                      onCheckedChange={setPushNotifications} 
                    />
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Preferences
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 