"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye } from "lucide-react";
import { EyeOff } from "lucide-react";
import { GithubIcon } from "lucide-react";
import { Mail } from "lucide-react";
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/translations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { language } = useLanguage();
  const t = translations[language];
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'tenant',
    phone: '',
    agreeToTerms: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Check for type parameter in URL
  useEffect(() => {
    // Get the URL search params
    const params = new URLSearchParams(window.location.search);
    const type = params.get('type');
    
    // If type is set to landlord, update the form
    if (type === 'landlord') {
      setFormData(prev => ({
        ...prev,
        userType: 'landlord'
      }));
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s-]{10,}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Error",
        description: "Please fix the errors in the form.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Call the register API
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          password: formData.password,
          role: formData.userType,
          phone: formData.phone
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      toast({
        title: "Success!",
        description: "Your account has been created successfully.",
      });
      
      // Redirect to login page
      router.push('/login');
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/30 bg-cover bg-center py-12 px-4 sm:px-6 lg:px-8" 
         style={{ backgroundImage: "url('/images/gaza-background.jpg')", backgroundBlendMode: "overlay" }}>
      <div className="max-w-2xl w-full space-y-8 bg-white/90 dark:bg-gray-800/95 backdrop-blur-sm p-8 rounded-xl shadow-2xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t?.auth?.register?.title || 'Create an Account'}
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {t?.auth?.register?.subtitle || 'Join our community of renters and landlords'}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="firstName">
                {t?.auth?.register?.firstName || 'First Name'}
              </Label>
              <Input
                id="firstName"
                name="firstName"
                type="text"
                required
                value={formData.firstName}
                onChange={handleInputChange}
                className={`mt-1 ${errors.firstName ? 'border-red-500' : ''}`}
              />
              {errors.firstName && (
                <p className="mt-1 text-sm text-red-500">{errors.firstName}</p>
              )}
            </div>

            <div>
              <Label htmlFor="lastName">
                {t?.auth?.register?.lastName || 'Last Name'}
              </Label>
              <Input
                id="lastName"
                name="lastName"
                type="text"
                required
                value={formData.lastName}
                onChange={handleInputChange}
                className={`mt-1 ${errors.lastName ? 'border-red-500' : ''}`}
              />
              {errors.lastName && (
                <p className="mt-1 text-sm text-red-500">{errors.lastName}</p>
              )}
            </div>

            <div>
              <Label htmlFor="email">
                {t?.auth?.register?.email || 'Email address'}
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className={`mt-1 ${errors.email ? 'border-red-500' : ''}`}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            <div>
              <Label htmlFor="phone">
                {t?.auth?.register?.phone || 'Phone Number'}
              </Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={handleInputChange}
                className={`mt-1 ${errors.phone ? 'border-red-500' : ''}`}
                placeholder="+255"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
              )}
            </div>

            <div>
              <Label htmlFor="password">
                {t?.auth?.register?.password || 'Password'}
              </Label>
              <div className="relative mt-1">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`pr-10 ${errors.password ? 'border-red-500' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">{errors.password}</p>
              )}
            </div>

            <div>
              <Label htmlFor="confirmPassword">
                {t?.auth?.register?.confirmPassword || 'Confirm Password'}
              </Label>
              <div className="relative mt-1">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`pr-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label>
                {t?.auth?.register?.userType || 'I am a'}
              </Label>
              <RadioGroup
                value={formData.userType}
                onValueChange={(value) => setFormData(prev => ({ ...prev, userType: value }))}
                className="flex space-x-4 mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="tenant" id="tenant" />
                  <Label htmlFor="tenant">{t?.auth?.register?.tenant || 'Tenant'}</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="agreeToTerms"
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, agreeToTerms: checked as boolean }))
                }
              />
              <Label
                htmlFor="agreeToTerms"
                className={`text-sm ${errors.agreeToTerms ? 'text-red-500' : ''}`}
              >
                {t?.auth?.register?.agreeTerms || 'I agree to the'}{' '}
                <Link
                  href="/terms"
                  className="text-primary hover:text-primary/90"
                >
                  {t?.auth?.register?.terms || 'Terms and Conditions'}
                </Link>
              </Label>
            </div>
            {errors.agreeToTerms && (
              <p className="text-sm text-red-500">{errors.agreeToTerms}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {t?.auth?.register?.creating || 'Creating account...'}
              </span>
            ) : (
              t?.auth?.register?.create || 'Create Account'
            )}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">
                {t?.auth?.register?.orContinueWith || 'Or continue with'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button
              type="button"
              variant="outline"
              className="w-full flex items-center justify-center hover:bg-primary/10"
              onClick={() => {
                toast({
                  title: "Coming Soon",
                  description: "Google authentication will be available soon.",
                });
              }}
            >
              <Mail className="h-5 w-5 mr-2" />
              Google
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full flex items-center justify-center hover:bg-primary/10"
              onClick={() => {
                toast({
                  title: "Coming Soon",
                  description: "GitHub authentication will be available soon.",
                });
              }}
            >
              <GithubIcon className="h-5 w-5 mr-2" />
              GitHub
            </Button>
          </div>

          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            {t?.auth?.register?.haveAccount || 'Already have an account?'}{' '}
            <Link
              href="/login"
              className="font-medium text-primary hover:text-primary/90"
            >
              {t?.auth?.register?.signIn || 'Sign in'}
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
} 