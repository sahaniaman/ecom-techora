import type { WebhookEvent } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook } from "svix";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(request: Request) {
  const CLERK_WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!CLERK_WEBHOOK_SECRET) {
    throw new Error(
      "Please define the CLERK_WEBHOOK_SECRET environment variable inside .env",
    );
  }

  const headerPayload = headers();
  const awaitedHeaderPayload = await headerPayload;

  const svix_id = awaitedHeaderPayload.get("svix-id");
  const svix_timestamp = awaitedHeaderPayload.get("svix-timestamp");
  const svix_signature = awaitedHeaderPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error Occured - No svix header");
  }

  const payload = await request.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(CLERK_WEBHOOK_SECRET);

  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-signature": svix_signature,
      "svix-timestamp": svix_timestamp,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error Verifying Webhook", err);
    return new Response("Error Occured - Verifying Webhook", { status: 400 });
  }

  const { id } = evt.data;
  const eventType = evt.type;

  console.log("CLERK_WEBHOOK_SECRET     ", CLERK_WEBHOOK_SECRET);
  console.log("payload body     ", body);
  console.log("evt     ", evt);
  console.log("id     ", id);
  console.log("eventType     ", eventType);

  if (eventType === "user.created") {
    try {
      await dbConnect();

      // First user should be Admin
      const userCount = await User.countDocuments();
      const role = userCount === 0 ? "SUPER_ADMIN" : "USER";

      const {
        id,
        first_name,
        last_name,
        email_addresses,
        primary_email_address_id,
        phone_numbers,
        primary_phone_number_id,
        image_url,
        has_image,
      } = evt.data;

      const clerkId = id;

      const primaryEmail = email_addresses.find(
        (email) => email.id === primary_email_address_id,
      );

      const primaryPhoneNumber = phone_numbers.find(
        (phoneNumber) => phoneNumber.id === primary_phone_number_id,
      );

      let avatar: string = "";

      if (has_image) {
        avatar = image_url;
      }

      console.log("primaryEmail   ", primaryEmail);

      if (!primaryEmail) {
        return new Response("No Primary Email was Found.", { status: 404 });
      }

      // Recommended with basic profile
      const newUser = await User.create({
        clerkId: clerkId,
        email: primaryEmail.email_address,
        phone: primaryPhoneNumber?.phone_number,
        role: role,
        profile: {
          firstName: first_name,
          lastName: last_name,
          avatar: avatar,
        },
      });
      console.log("User Created in Database from webhook", newUser);
      return new Response("User Created in Database from webhook", {status: 200});
    } catch (err) {
      console.error("Error creating user   ", err);
      return new Response("Error Occured", { status: 400 });
    }
  }

  return new Response("Webhook Recieved Successfully");
}

export async function GET() {
  return NextResponse.json({ message: "Webhook endpoint" });
}
