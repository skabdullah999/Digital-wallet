"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowDownCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase/client"

export default function CashOut() {
  const [amount, setAmount] = useState("")
  const [method, setMethod] = useState("")
  const [accountNumber, setAccountNumber] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { profile } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  const handleCashOut = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!profile) {
      toast({
        title: "Error",
        description: "You must be logged in to withdraw money",
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
        description: "You do not have enough balance to complete this withdrawal",
        variant: "destructive",
      })
      return
    }

    if (!method) {
      toast({
        title: "Method required",
        description: "Please select a withdrawal method",
        variant: "destructive",
      })
      return
    }

    if (!accountNumber) {
      toast({
        title: "Account required",
        description: "Please enter an account number or destination",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    // Create transaction (using admin ID as receiver for cash out)
    const { error: transactionError } = await supabase.from("transactions").insert({
      sender_id: profile.id,
      receiver_id: profile.id, // In a real app, this would be the agent's ID
      amount: amountValue,
      type: "cash_out",
      description: `Cash out via ${method} to ${accountNumber}`,
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
      .update({ wallet_balance: profile.wallet_balance - amountValue })
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
      title: "Cash out successful",
      description: `৳${amountValue.toFixed(2)} has been withdrawn from your wallet`,
    })

    setIsLoading(false)
    router.push("/dashboard")
  }

  return (
    <div className="container max-w-md mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Cash Out</h1>
        <p className="text-gray-500">Withdraw money from your DigiWallet</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Withdraw Money</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCashOut} className="space-y-4">
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
              {profile && <p className="text-sm text-gray-500">Available: ৳{profile.wallet_balance.toFixed(2)}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="method">Withdrawal Method</Label>
              <Select onValueChange={setMethod}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select withdrawal method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank">Bank Transfer</SelectItem>
                  <SelectItem value="agent">Agent</SelectItem>
                  <SelectItem value="mobile">Mobile Banking</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="account">Account Number / Destination</Label>
              <Input
                id="account"
                placeholder="Enter account number or destination"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="h-12"
              />
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleCashOut}
            className="w-full h-12 bg-pink-600 hover:bg-pink-700"
            disabled={isLoading || !amount || !method || !accountNumber}
          >
            {isLoading ? "Processing..." : "Withdraw Money"} <ArrowDownCircle className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
