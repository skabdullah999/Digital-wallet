import { NextResponse } from "next/server"
import { supabaseClient } from "@/lib/supabase-client"

export async function POST(request: Request) {
  try {
    const { name, phone, password } = await request.json()

    // Validate input
    if (!name || !phone || !password) {
      return NextResponse.json({ error: "Name, phone, and password are required" }, { status: 400 })
    }

    // Check if user already exists
    const { data: existingUser } = await supabaseClient.from("users").select().eq("phone", phone).single()

    if (existingUser) {
      return NextResponse.json({ error: "User with this phone number already exists" }, { status: 409 })
    }

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabaseClient.auth.signUp({
      phone,
      password,
      options: {
        data: {
          name,
        },
      },
    })

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    // Create user profile with wallet in the database
    const { data: userData, error: userError } = await supabaseClient
      .from("users")
      .insert({
        id: authData.user.id,
        name,
        phone,
        wallet_balance: 0, // Initial balance is 0
      })
      .select()
      .single()

    if (userError) {
      return NextResponse.json({ error: userError.message }, { status: 400 })
    }

    return NextResponse.json({
      message: "User registered successfully",
      user: userData,
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
