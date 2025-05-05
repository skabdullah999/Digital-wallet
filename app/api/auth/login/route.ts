import { NextResponse } from "next/server"
import { supabaseClient } from "@/lib/supabase-client"

export async function POST(request: Request) {
  try {
    const { phone, password } = await request.json()

    // Validate input
    if (!phone || !password) {
      return NextResponse.json({ error: "Phone and password are required" }, { status: 400 })
    }

    // Authenticate user
    const { data, error } = await supabaseClient.auth.signIn({
      phone,
      password,
    })

    if (error) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Get user profile with wallet balance
    const { data: userData, error: userError } = await supabaseClient
      .from("users")
      .select()
      .eq("id", data.user.id)
      .single()

    if (userError) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 })
    }

    return NextResponse.json({
      message: "Login successful",
      user: userData,
      session: data,
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
