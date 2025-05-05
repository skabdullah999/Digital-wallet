"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { PlusCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase/client"

export default function CashIn() {
  const [amount, setAmount] = useState("")
  const [method, setMethod] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { profile } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  const handleCashIn = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!profile) {
      toast({
        title: "Error",
        description: "You must be logged in to add money",
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

    if (!method) {
      toast({
        title: "Method required",
        description: "Please select a payment method",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    // In a real app, this would integrate with payment processors
    // For now, we'll simulate the cash in process

    // Create transaction (using admin ID as sender for cash in)
    const { error: transactionError } = await supabase.from("transactions").insert({
      sender_id: profile.id, // In a real app, this would be the agent's ID
      receiver_id: profile.id,
      amount: amountValue,
      type: "cash_in",
      description: `Cash in via ${method}`,
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

    // Update user balance
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ wallet_balance: profile.wallet_balance + amountValue })
      .eq("id", profile.id)

    if (updateError) {
      toast({
        title: "Balance update failed",
        description: "The transaction was recorded but balance update failed",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    toast({
      title: "Cash in successful",
      description: `৳${amountValue.toFixed(2)} has been added to your wallet`,
    })

    setIsLoading(false)
    router.push("/dashboard")
  }

  return (
    <div className="container max-w-md mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Cash In</h1>
        <p className="text-gray-500">Add money to your DigiWallet</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add Money</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCashIn} className="space-y-4">
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
              <Label htmlFor="method">Payment Method</Label>
              <Select onValueChange={setMethod}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank">Bank Transfer</SelectItem>
                  <SelectItem value="card">Credit/Debit Card</SelectItem>
                  <SelectItem value="agent">Agent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleCashIn}
            className="w-full h-12 bg-pink-600 hover:bg-pink-700"
            disabled={isLoading || !amount || !method}
          >
            {isLoading ? "Processing..." : "Add Money"} <PlusCircle className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
