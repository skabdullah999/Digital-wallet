"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase/client"

export default function SendMoney() {
  // Update the state variables
  const [receiverEmail, setReceiverEmail] = useState("")
  const [receiverPhone, setReceiverPhone] = useState("")
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [receiverName, setReceiverName] = useState<string | null>(null)
  const { profile } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  // Update the handleEmailBlur function
  const handleEmailBlur = async () => {
    if (!receiverEmail) return

    const { data, error } = await supabase.from("profiles").select("name").eq("email", receiverEmail).single()

    if (data) {
      setReceiverName(data.name)
    } else {
      setReceiverName(null)
    }
  }

  const handlePhoneBlur = async () => {
    if (!receiverPhone) return

    const { data, error } = await supabase.from("profiles").select("name").eq("phone", receiverPhone).single()

    if (data) {
      setReceiverName(data.name)
    } else {
      setReceiverName(null)
    }
  }

  const handleSendMoney = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!profile) {
      toast({
        title: "Error",
        description: "You must be logged in to send money",
        variant: "destructive",
      })
      return
    }

    const amountValue = Number.parseFloat(amount)
    if (isNaN(amountValue) || amountValue <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      })
      return
    }

    if (amountValue > profile.wallet_balance) {
      toast({
        title: "Insufficient balance",
        description: "You do not have enough balance to complete this transaction",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    // Update the handleSendMoney function to find receiver by email
    // Find receiver
    const { data: receiver, error: receiverError } = await supabase
      .from("profiles")
      .select("id, name, wallet_balance")
      .eq("email", receiverEmail)
      .single()

    if (receiverError || !receiver) {
      toast({
        title: "Receiver not found",
        description: "The phone number you entered does not belong to any user",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    // Create transaction
    const { error: transactionError } = await supabase.from("transactions").insert({
      sender_id: profile.id,
      receiver_id: receiver.id,
      amount: amountValue,
      type: "send",
      description: description || `Payment to ${receiver.name}`,
    })

    if (transactionError) {
      toast({
        title: "Transaction failed",
        description: transactionError.message,
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    // Update sender balance
    const { error: senderUpdateError } = await supabase
      .from("profiles")
      .update({ wallet_balance: profile.wallet_balance - amountValue })
      .eq("id", profile.id)

    // Update receiver balance
    const { error: receiverUpdateError } = await supabase
      .from("profiles")
      .update({ wallet_balance: receiver.wallet_balance + amountValue })
      .eq("id", receiver.id)

    if (senderUpdateError || receiverUpdateError) {
      toast({
        title: "Balance update failed",
        description: "The transaction was recorded but balance update failed",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    toast({
      title: "Money sent successfully",
      description: `You have sent ৳${amountValue.toFixed(2)} to ${receiver.name}`,
    })

    setIsLoading(false)
    router.push("/dashboard")
  }

  return (
    <div className="container max-w-md mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Send Money</h1>
        <p className="text-gray-500">Transfer money to another DigiWallet user</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Enter Transfer Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSendMoney} className="space-y-4">
            {/* Update the form field */}
            <div className="space-y-2">
              <Label htmlFor="receiver">Receiver Email Address</Label>
              <Input
                id="receiver"
                type="email"
                placeholder="recipient@example.com"
                value={receiverEmail}
                onChange={(e) => setReceiverEmail(e.target.value)}
                onBlur={handleEmailBlur}
                className="h-12"
              />
              {receiverName && <p className="text-sm text-green-600 mt-1">Sending to: {receiverName}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="receiver">Receiver Phone Number</Label>
              <Input
                id="receiver"
                placeholder="01XXXXXXXXX"
                value={receiverPhone}
                onChange={(e) => setReceiverPhone(e.target.value)}
                onBlur={handlePhoneBlur}
                className="h-12"
              />
              {receiverName && <p className="text-sm text-green-600 mt-1">Sending to: {receiverName}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount (৳)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                placeholder="What's this for?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="h-12"
              />
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleSendMoney}
            className="w-full h-12 bg-pink-600 hover:bg-pink-700"
            disabled={isLoading || !receiverEmail || !amount}
          >
            {isLoading ? "Processing..." : "Send Money"} <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
