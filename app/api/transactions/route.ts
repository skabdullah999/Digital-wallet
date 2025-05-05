import { NextResponse } from "next/server"
import { supabaseClient } from "@/lib/supabase-client"

export async function POST(request: Request) {
  try {
    const { senderId, receiverId, amount, type, description } = await request.json()

    // Validate input
    if (!senderId || !receiverId || !amount || !type) {
      return NextResponse.json(
        { error: "Sender, receiver, amount, and transaction type are required" },
        { status: 400 },
      )
    }

    if (amount <= 0) {
      return NextResponse.json({ error: "Amount must be greater than 0" }, { status: 400 })
    }

    // Get sender's wallet
    const { data: sender, error: senderError } = await supabaseClient.from("users").select().eq("id", senderId).single()

    if (senderError || !sender) {
      return NextResponse.json({ error: "Sender not found" }, { status: 404 })
    }

    // Get receiver's wallet
    const { data: receiver, error: receiverError } = await supabaseClient
      .from("users")
      .select()
      .eq("id", receiverId)
      .single()

    if (receiverError || !receiver) {
      return NextResponse.json({ error: "Receiver not found" }, { status: 404 })
    }

    // Check if sender has enough balance for send or cash out
    if ((type === "send" || type === "cash_out") && sender.wallet_balance < amount) {
      return NextResponse.json({ error: "Insufficient balance" }, { status: 400 })
    }

    // Create transaction record
    const { data: transaction, error: transactionError } = await supabaseClient
      .from("transactions")
      .insert({
        sender_id: senderId,
        receiver_id: receiverId,
        amount,
        type,
        description,
      })
      .select()
      .single()

    if (transactionError) {
      return NextResponse.json({ error: transactionError.message }, { status: 400 })
    }

    // Update sender's balance
    if (type === "send" || type === "cash_out") {
      await supabaseClient
        .from("users")
        .update({ wallet_balance: sender.wallet_balance - amount })
        .eq("id", senderId)
        .single()
    }

    // Update receiver's balance
    if (type === "send" || type === "cash_in") {
      await supabaseClient
        .from("users")
        .update({ wallet_balance: receiver.wallet_balance + amount })
        .eq("id", receiverId)
        .single()
    }

    return NextResponse.json({
      message: "Transaction completed successfully",
      transaction,
    })
  } catch (error) {
    console.error("Transaction error:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
