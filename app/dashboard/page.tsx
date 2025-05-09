"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/contexts/LanguageContext'
import { translations } from '@/translations'
import { useUser } from '@/contexts/UserContext'

export default function DashboardPage() {
  const router = useRouter()
  const { language } = useLanguage()
  const { user } = useUser()
  const t = translations[language]

  useEffect(() => {
    // Check user role and redirect to appropriate dashboard
    if (user) {
      if (user.role === 'tenant') {
        router.push('/dashboard/tenant')
      } else if (user.role === 'landlord') {
        router.push('/dashboard/landlord')
      } else if (user.role === 'admin') {
        router.push('/dashboard/admin')
      } else {
        // Default fallback
        router.push('/dashboard/tenant')
      }
    }
  }, [router, user])

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      <span className="ml-4 text-gray-600 dark:text-gray-400">
        {t?.common?.redirecting || 'Redirecting to dashboard...'}
      </span>
    </div>
  )
} 