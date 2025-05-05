"use client"

import { useEffect, useState } from "react"
import { ArrowUpRight, ArrowDownLeft, Eye, EyeOff } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase/client"
import type { Transaction } from "@/lib/supabase/client"

export default function Dashboard() {
  const { profile } = useAuth()
  const [showBalance, setShowBalance] = useState(true)
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchRecentTransactions() {
      if (!profile) return

      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .or(`sender_id.eq.${profile.id},receiver_id.eq.${profile.id}`)
        .order("created_at", { ascending: false })
        .limit(5)

      if (!error && data) {
        setRecentTransactions(data)
      }
      setLoading(false)
    }

    fetchRecentTransactions()
  }, [profile])

  if (!profile) {
    return <div className="p-4">Loading...</div>
  }

  return (
    <div className="container max-w-md mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Hello, {profile.name}</h1>
      </div>

      <Card className="bg-gradient-to-r from-pink-500 to-pink-600 text-white mb-6">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm opacity-80">Available Balance</span>
            <button onClick={() => setShowBalance(!showBalance)} className="text-white opacity-80 hover:opacity-100">
              {showBalance ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <div className="text-3xl font-bold mb-4">
            {showBalance ? `৳${profile.wallet_balance.toFixed(2)}` : "৳•••••"}
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant="outline"
              className="bg-white/20 hover:bg-white/30 border-white/40 text-white"
              onClick={() => (window.location.href = "/send-money")}
            >
              Send
            </Button>
            <Button
              variant="outline"
              className="bg-white/20 hover:bg-white/30 border-white/40 text-white"
              onClick={() => (window.location.href = "/cash-in")}
            >
              Cash In
            </Button>
            <Button
              variant="outline"
              className="bg-white/20 hover:bg-white/30 border-white/40 text-white"
              onClick={() => (window.location.href = "/cash-out")}
            >
              Cash Out
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-3">Recent Transactions</h2>
        {loading ? (
          <p className="text-center py-4 text-gray-500">Loading transactions...</p>
        ) : recentTransactions.length > 0 ? (
          <div className="space-y-3">
            {recentTransactions.map((transaction) => {
              const isSender = transaction.sender_id === profile.id
              const transactionType = transaction.type

              return (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm"
                >
                  <div className="flex items-center">
                    <div className={`p-2 rounded-full mr-3 ${isSender ? "bg-red-100" : "bg-green-100"}`}>
                      {isSender ? (
                        <ArrowUpRight className="h-5 w-5 text-red-500" />
                      ) : (
                        <ArrowDownLeft className="h-5 w-5 text-green-500" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">
                        {transactionType === "send"
                          ? isSender
                            ? "Sent Money"
                            : "Received Money"
                          : transactionType === "cash_in"
                            ? "Cash In"
                            : "Cash Out"}
                      </p>
                      <p className="text-xs text-gray-500">{new Date(transaction.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className={`font-semibold ${isSender ? "text-red-500" : "text-green-500"}`}>
                    {isSender ? "-" : "+"} ৳{transaction.amount.toFixed(2)}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-center py-4 text-gray-500">No recent transactions</p>
        )}

        <div className="mt-4 text-center">
          <Button
            variant="ghost"
            className="text-pink-600 hover:text-pink-700 hover:bg-pink-50"
            onClick={() => (window.location.href = "/transactions")}
          >
            View All Transactions
          </Button>
        </div>
      </div>
    </div>
  )
}
