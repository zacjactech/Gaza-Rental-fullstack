"use client";

import { useState } from 'react';
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

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { language } = useLanguage();
  const t = translations[language];
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Call the login API
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      toast({
        title: "Success!",
        description: "You have successfully logged in.",
      });
      
      // Redirect to dashboard instead of home page
      router.push('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : "An unexpected error occurred during login.";
        
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/30 bg-cover bg-center py-12 px-4 sm:px-6 lg:px-8" 
         style={{ backgroundImage: "url('/images/gaza-background.jpg')", backgroundBlendMode: "overlay" }}>
      <div className="max-w-md w-full space-y-8 bg-white/90 dark:bg-gray-800/95 backdrop-blur-sm p-8 rounded-xl shadow-2xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t?.auth?.login?.title || 'Welcome back'}
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {t?.auth?.login?.subtitle || 'Please sign in to your account'}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">
                {t?.auth?.login?.email || 'Email address'}
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="mt-1"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <Label htmlFor="password">
                {t?.auth?.login?.password || 'Password'}
              </Label>
              <div className="relative mt-1">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="pr-10"
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
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="rememberMe"
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <Label htmlFor="remember-me" className="ml-2">
                  {t?.auth?.login?.rememberMe || 'Remember me'}
                </Label>
              </div>

              <Link
                href="/forgot-password"
                className="text-sm font-medium text-primary hover:text-primary/90"
              >
                {t?.auth?.login?.forgotPassword || 'Forgot your password?'}
              </Link>
            </div>
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
                {t?.auth?.login?.signingIn || 'Signing in...'}
              </span>
            ) : (
              t?.auth?.login?.signIn || 'Sign in'
            )}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">
                {t?.auth?.login?.orContinueWith || 'Or continue with'}
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
            {t?.auth?.login?.noAccount || "Don't have an account?"}{' '}
            <Link
              href="/register"
              className="font-medium text-primary hover:text-primary/90"
            >
              {t?.auth?.login?.register || 'Register now'}
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}