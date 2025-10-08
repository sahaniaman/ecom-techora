import { clerkClient } from "@clerk/nextjs/server"
import {type NextRequest, NextResponse } from "next/server"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ clerkId: string }> }
) {
  try {
    const awaitedParams = await params
    const client = await clerkClient()
    const user = await client.users.getUser(awaitedParams.clerkId)
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }
    
    // Return only the data you need
    return NextResponse.json({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.emailAddresses[0]?.emailAddress,
      imageUrl: user.imageUrl,
    })
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 })
  }
}