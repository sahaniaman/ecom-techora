// app/api/clerk-webhook/route.ts  (or pages/api/clerk-webhook.ts)
// Ensure this file runs on Node runtime (not edge)
export const runtime = "nodejs";

import type { WebhookEvent } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook } from "svix";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(request: Request) {
  const CLERK_WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  if (!CLERK_WEBHOOK_SECRET) {
    console.error("Missing CLERK_WEBHOOK_SECRET");
    return new Response("Server misconfiguration: missing webhook secret", { status: 500 });
  }

  // --- IMPORTANT: use raw text for svix verification ---
  const rawBody = await request.text();

  // read headers
  const hdrs = headers();
  const svix_id = (await hdrs).get("svix-id");
  const svix_timestamp = (await hdrs).get("svix-timestamp");
  const svix_signature = (await hdrs).get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error("Missing svix headers", { svix_id, svix_timestamp, svix_signature });
    return new Response("Missing svix headers", { status: 400 });
  }

  const wh = new Webhook(CLERK_WEBHOOK_SECRET);

  let evt: WebhookEvent;
  try {
    // verify raw body and pass header object
    evt = wh.verify(rawBody, {
      "svix-id": svix_id,
      "svix-signature": svix_signature,
      "svix-timestamp": svix_timestamp,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Svix verification failed:", err);
    return new Response("Webhook verification failed", { status: 400 });
  }

  // optional: log event type for debugging
  const eventType = evt?.type;
  console.log("Received Clerk event:", eventType);

  // connect DB (await!)
  try {
    await dbConnect();
  } catch (err) {
    console.error("DB connection error:", err);
    return new Response("DB connection error", { status: 500 });
  }

  // handle user.created event
  if (eventType === "user.created") {
    try {
      const data = evt.data as any; // Clerk user object
      const clerkId = data.id as string;

      // pick primary email / phone carefully
      const primaryEmailObj = Array.isArray(data.email_addresses)
        ? data.email_addresses.find((e: any) => e.id === data.primary_email_address_id)
        : undefined;

      const primaryPhoneObj = Array.isArray(data.phone_numbers)
        ? data.phone_numbers.find((p: any) => p.id === data.primary_phone_number_id)
        : undefined;

      if (!primaryEmailObj?.email_address) {
        console.warn("No primary email in webhook payload", { data });
        // still continue? Most apps require email — return 400 so Clerk can retry
        return new Response("No primary email found in webhook payload", { status: 400 });
      }

      // determine role: first user => SUPER_ADMIN
      const userCount = await User.countDocuments();
      const role = userCount === 0 ? "SUPER_ADMIN" : "USER";

      const newUserPayload = {
        clerkId,
        email: primaryEmailObj.email_address,
        phone: primaryPhoneObj?.phone_number ?? "",
        role,
        profile: {
          firstName: data.first_name ?? "",
          lastName: data.last_name ?? "",
          avatar: data.has_image ? data.image_url ?? data.profile_image_url ?? "" : "",
        }
      };

      const existing = await User.findOne({ clerkId });
      if (existing) {
        console.log("User already exists for clerkId, updating basic fields");
        existing.email = newUserPayload.email;
        existing.phone = newUserPayload.phone;
        existing.profile = { ...existing.profile, ...newUserPayload.profile };
        await existing.save();
        return NextResponse.json({ message: "User already existed, updated." }, { status: 200 });
      }

      const createdUser = await User.create(newUserPayload);
      // do not leak DB object in plain string; return JSON
      return NextResponse.json({ message: "User created from webhook", userId: createdUser.id }, { status: 201 });
    } catch (err) {
      console.error("Error creating user from webhook:", err);
      return new Response("Error creating user", { status: 500 });
    }
  }

  // default ok for other events
  return NextResponse.json({ message: "Webhook received" }, { status: 200 });
}

export async function GET() {
  return NextResponse.json({ message: "Webhook endpoint (GET)" });
}
