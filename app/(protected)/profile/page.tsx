"use client"

import type React from "react"

import { useState } from "react"
import { User, LogOut } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase/client"

export default function Profile() {
  const { profile, signOut } = useAuth()
  const [name, setName] = useState(profile?.name || "")
  const [pin, setPin] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!profile) return

    setIsLoading(true)

    const updates = {
      name,
      ...(pin ? { pin } : {}),
    }

    const { error } = await supabase.from("profiles").update(updates).eq("id", profile.id)

    if (error) {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      })

      // Clear PIN field after update
      setPin("")
    }

    setIsLoading(false)
  }

  if (!profile) {
    return <div className="p-4">Loading...</div>
  }

  return (
    <div className="container max-w-md mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-gray-500">Manage your account settings</p>
      </div>

      <div className="flex flex-col items-center justify-center mb-6">
        <div className="w-24 h-24 bg-pink-100 rounded-full flex items-center justify-center mb-4">
          <User className="h-12 w-12 text-pink-600" />
        </div>
        <h2 className="text-xl font-bold">{profile.name}</h2>
        <p className="text-gray-500">{profile.email}</p>
        <p className="text-gray-500">{profile.phone}</p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="h-12" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" value={profile.email} disabled className="h-12 bg-gray-50" />
              <p className="text-xs text-gray-500">Email address cannot be changed</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" value={profile.phone} disabled className="h-12 bg-gray-50" />
              <p className="text-xs text-gray-500">Phone number cannot be changed</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pin">Transaction PIN (Optional)</Label>
              <Input
                id="pin"
                type="password"
                placeholder="Set a 4-6 digit PIN"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                maxLength={6}
                className="h-12"
              />
              <p className="text-xs text-gray-500">Set a PIN for additional security during transactions</p>
            </div>

            <Button type="submit" className="w-full h-12 bg-pink-600 hover:bg-pink-700" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Profile"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-gray-500">
            Signing out will end your current session. You will need to log in again to access your account.
          </p>
        </CardContent>
        <CardFooter>
          <Button
            variant="outline"
            className="w-full h-12 border-red-300 text-red-600 hover:bg-red-50"
            onClick={signOut}
          >
            <LogOut className="mr-2 h-4 w-4" /> Sign Out
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
