"use client"

import { useEffect, useState } from "react"
import { ArrowUpRight, ArrowDownLeft } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase/client"
import type { Transaction } from "@/lib/supabase/client"

export default function Transactions() {
  const { profile } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")

  useEffect(() => {
    async function fetchTransactions() {
      if (!profile) return

      let query = supabase
        .from("transactions")
        .select("*")
        .or(`sender_id.eq.${profile.id},receiver_id.eq.${profile.id}`)
        .order("created_at", { ascending: false })

      if (filter !== "all") {
        query = query.eq("type", filter)
      }

      const { data, error } = await query

      if (!error && data) {
        setTransactions(data)
      }
      setLoading(false)
    }

    fetchTransactions()
  }, [profile, filter])

  if (!profile) {
    return <div className="p-4">Loading...</div>
  }

  return (
    <div className="container max-w-md mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Transactions</h1>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter transactions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Transactions</SelectItem>
                <SelectItem value="send">Send Money</SelectItem>
                <SelectItem value="cash_in">Cash In</SelectItem>
                <SelectItem value="cash_out">Cash Out</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <p className="text-center py-8 text-gray-500">Loading transactions...</p>
          ) : transactions.length > 0 ? (
            <div className="space-y-3">
              {transactions.map((transaction) => {
                const isSender = transaction.sender_id === profile.id
                const transactionType = transaction.type

                return (
                  <div key={transaction.id} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <div
                        className={`p-2 rounded-full mr-3 ${
                          isSender && transactionType !== "cash_in" ? "bg-red-100" : "bg-green-100"
                        }`}
                      >
                        {isSender && transactionType !== "cash_in" ? (
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
                        <p className="text-xs text-gray-500">{new Date(transaction.created_at).toLocaleString()}</p>
                        {transaction.description && (
                          <p className="text-xs text-gray-500 mt-1">{transaction.description}</p>
                        )}
                      </div>
                    </div>
                    <div
                      className={`font-semibold ${
                        isSender && transactionType !== "cash_in" ? "text-red-500" : "text-green-500"
                      }`}
                    >
                      {isSender && transactionType !== "cash_in" ? "-" : "+"} ৳{transaction.amount.toFixed(2)}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-center py-8 text-gray-500">No transactions found</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
