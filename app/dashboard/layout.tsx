"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { 
  Building, 
  Home, 
  PlusCircle, 
  Settings, 
  MessageSquare, 
  ListChecks,
  ChevronLeft,
  ChevronRight,
  User,
  Heart
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/LanguageContext"
import { translations } from "@/translations"
import { MessageNotificationBadge } from "@/components/MessageNotificationBadge"

export const dynamic = 'force-dynamic';

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const { language } = useLanguage()
  const t = translations[language]

  const isLandlordDashboard = pathname.includes('/dashboard/landlord')

  // Navigation items
  const navigationItems = isLandlordDashboard 
    ? [
        {
          title: "Dashboard",
          href: "/dashboard/landlord",
          icon: Building,
        },
        {
          title: "My Properties",
          href: "/dashboard/landlord/properties",
          icon: Home,
        },
        {
          title: "Add Property",
          href: "/dashboard/landlord/properties/new",
          icon: PlusCircle,
        },
        {
          title: "Messages",
          href: "/dashboard/landlord/messages",
          icon: MessageSquare,
          showNotification: true
        },
        {
          title: "Applications",
          href: "/dashboard/landlord/applications",
          icon: ListChecks,
        },
        {
          title: "Settings",
          href: "/dashboard/landlord/settings",
          icon: Settings,
        },
      ]
    : [
        {
          title: "Dashboard",
          href: "/dashboard/tenant",
          icon: User,
        },
        {
          title: "My Applications",
          href: "/dashboard/tenant/applications",
          icon: ListChecks,
        },
        {
          title: "Saved Properties",
          href: "/dashboard/tenant/saved",
          icon: Heart,
        },
        {
          title: "Messages",
          href: "/dashboard/tenant/messages",
          icon: MessageSquare,
          showNotification: true
        },
        {
          title: "Settings",
          href: "/dashboard/tenant/settings",
          icon: Settings,
        },
      ]

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <aside 
        className={cn(
          "bg-white dark:bg-gray-800 h-screen fixed top-0 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-300",
          collapsed ? "w-16" : "w-64"
        )}
      >
        <div className="flex items-center p-4 h-16 border-b border-gray-200 dark:border-gray-700">
          {!collapsed && (
            <Link href="/" className="flex items-center gap-2">
              <Building className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg">
                {isLandlordDashboard ? "Landlord" : "Tenant"}
              </span>
            </Link>
          )}
          {collapsed && (
            <Building className="h-6 w-6 text-primary mx-auto" />
          )}
        </div>
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1 px-2">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md transition-colors relative",
                  pathname === item.href || (pathname.startsWith(item.href + '/') && item.href !== '/dashboard/tenant' && item.href !== '/dashboard/landlord')
                    ? "bg-primary/10 text-primary"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                )}
              >
                <item.icon className={cn("h-5 w-5 flex-shrink-0")} />
                {!collapsed && <span>{item.title}</span>}
                {item.showNotification && <MessageNotificationBadge />}
              </Link>
            ))}
          </nav>
        </div>
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-center"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={cn(
        "flex-1 transition-all duration-300",
        collapsed ? "ml-16" : "ml-64"
      )}>
        {children}
      </main>
    </div>
  )
} 