"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Send, PlusCircle, ArrowDownCircle, User } from "lucide-react"

export function Navigation() {
  const pathname = usePathname()

  const navItems = [
    { href: "/dashboard", label: "Home", icon: Home },
    { href: "/send-money", label: "Send", icon: Send },
    { href: "/cash-in", label: "Cash In", icon: PlusCircle },
    { href: "/cash-out", label: "Cash Out", icon: ArrowDownCircle },
    { href: "/profile", label: "Profile", icon: User },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
      <div className="flex justify-around">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center py-2 px-3 ${
                isActive ? "text-pink-600" : "text-gray-500 hover:text-pink-500"
              }`}
            >
              <Icon className={`h-6 w-6 ${isActive ? "text-pink-600" : "text-gray-500"}`} />
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
