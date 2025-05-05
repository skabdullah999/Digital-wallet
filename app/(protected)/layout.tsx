import type React from "react"
import { Navigation } from "@/components/navigation"

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex-1 pb-16">{children}</main>
      <Navigation />
    </div>
  )
}
