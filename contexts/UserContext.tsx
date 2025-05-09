'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'tenant' | 'landlord' | 'admin';
  image?: string;
  avatar?: string;
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: { 
    name: string; 
    email: string; 
    password: string; 
    role?: 'tenant' | 'landlord';
    phone?: string;
  }) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Function to fetch current user data
  const fetchUserData = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const userData = await res.json();
        setUser(userData.user);
        return userData.user;
      } else {
        return null;
      }
    } catch (err) {
      console.error('Failed to fetch user data', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Check if user is logged in on initial load
  useEffect(() => {
    fetchUserData();
  }, []);

  // Function to refresh user data
  const refreshUser = async () => {
    setLoading(true);
    await fetchUserData();
  };

  // Login function
  const login = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Login failed');
      }

      const { user } = await res.json();
      setUser(user);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
      });
      
      if (!res.ok) {
        throw new Error('Logout failed');
      }
      
      setUser(null);
      router.push('/login');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (userData: { 
    name: string; 
    email: string; 
    password: string; 
    role?: 'tenant' | 'landlord';
    phone?: string;
  }) => {
    try {
      setError(null);
      setLoading(true);
      
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Registration failed');
      }

      const { user } = await res.json();
      setUser(user);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <UserContext.Provider value={{ user, loading, error, login, logout, register, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
} 