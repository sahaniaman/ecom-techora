import type { WebhookEvent } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { Webhook } from "svix";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { UserRole, UserStatus } from "@/types/User";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const CLERK_WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

    if (!CLERK_WEBHOOK_SECRET) {
      throw new Error(
        "Please define the CLERK_WEBHOOK_SECRET environment variable inside .env.local",
      );
    }

    // Get headers
    const svix_id = request.headers.get("svix-id");
    const svix_timestamp = request.headers.get("svix-timestamp");
    const svix_signature = request.headers.get("svix-signature");

    // If there are no headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
      return new NextResponse("Error occured -- no svix headers", {
        status: 400,
      });
    }

    // Get the body
    const payload = await request.json();
    const body = JSON.stringify(payload);

    // Create a new Svix instance with your secret.
    const wh = new Webhook(CLERK_WEBHOOK_SECRET);

    let evt: WebhookEvent;

    // Verify the payload with the headers
    try {
      evt = wh.verify(body, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      }) as WebhookEvent;
    } catch (err) {
      console.error("Error verifying webhook:", err);
      return new NextResponse("Error occured", {
        status: 400,
      });
    }

    // Handle the webhook
    const eventType = evt.type;

    if (eventType === "user.created") {
      const {
        id,
        email_addresses,
        first_name,
        last_name,
        image_url,
        phone_numbers,
      } = evt.data;

      // Create user in database
      const userData = {
        clerkId: id,
        email: email_addresses[0]?.email_address,
        phone: phone_numbers[0]?.phone_number,
        profile: {
          firstName: first_name || "",
          lastName: last_name || "",
          avatar: image_url,
        },
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
        emailVerified: email_addresses[0]?.verification?.status === "verified",
        phoneVerified: phone_numbers[0]?.verification?.status === "verified",
      };

      // Check if user already exists (safety check)
      const existingUser = await User.findOne({
        $or: [{ clerkId: id }, { email: userData.email }],
      });

      if (existingUser) {
        console.log("User already exists:", id);
        return NextResponse.json({
          success: true,
          message: "User already exists",
        });
      }

      // Create new user
      const newUser = new User(userData);
      await newUser.save();

      console.log("User created successfully:", id);
      return NextResponse.json({ success: true, message: "User created" });
    }

    if (eventType === "user.updated") {
      const {
        id,
        email_addresses,
        first_name,
        last_name,
        image_url,
        phone_numbers,
      } = evt.data;

      await User.findOneAndUpdate(
        { clerkId: id },
        {
          email: email_addresses[0]?.email_address,
          phone: phone_numbers[0]?.phone_number,
          "profile.firstName": first_name,
          "profile.lastName": last_name,
          "profile.avatar": image_url,
          emailVerified:
            email_addresses[0]?.verification?.status === "verified",
          phoneVerified: phone_numbers[0]?.verification?.status === "verified",
        },
      );

      console.log("User updated successfully:", id);
      return NextResponse.json({ success: true, message: "User updated" });
    }

    if (eventType === "user.deleted") {
      const { id } = evt.data;

      // Soft delete - mark user as inactive instead of deleting
      await User.findOneAndUpdate(
        { clerkId: id },
        { status: UserStatus.INACTIVE },
      );

      console.log("User marked as inactive:", id);
      return NextResponse.json({ success: true, message: "User deactivated" });
    }

    return NextResponse.json({ success: true, message: "Webhook processed" });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({ message: "Webhook endpoint" });
}
