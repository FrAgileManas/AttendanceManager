'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Users, ClipboardList, BarChart3 } from 'lucide-react'

export default function Navigation() {
  const pathname = usePathname()

  const navItems = [
    { href: '/members', label: 'Members', icon: Users },
    { href: '/attendance', label: 'Attendance', icon: ClipboardList },
    { href: '/dashboard', label: 'Dashboard', icon: BarChart3 }
  ]

  const isActive = (href) => pathname.startsWith(href)

  return (
    <nav className="bg-slate-800 text-white p-4">
      <div className="flex items-center justify-between">
        <div className="text-lg font-semibold">
          Attendance Manager
        </div>
        <div className="flex space-x-4">
          {navItems.map((item) => {
            const IconComponent = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200 ${
                  isActive(item.href)
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <IconComponent size={18} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
