import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

export type Profile = {
  id: string
  name: string
  email: string
  phone?: string
  wallet_balance: number
  pin?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export type Transaction = {
  id: string
  sender_id: string
  receiver_id: string
  amount: number
  type: "send" | "cash_in" | "cash_out"
  description?: string
  status: "pending" | "completed" | "failed"
  created_at: string
}
