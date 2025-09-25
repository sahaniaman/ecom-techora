import { NextResponse } from "next/server";
import  dbConnect  from "@/lib/mongodb";
import User, { IUser } from "@/models/User";


export async function POST(req: Request) {
  try {
    await dbConnect();

    const body = await req.json();
    const {
      id: clerkId,
      email_addresses,
      first_name,
      last_name,
      image_url,
    } = body.data;

    // Check if user exists
    const existing = await User.findOne({ clerkId });
    if (existing) return NextResponse.json({ ok: true });

    // First user should be Admin
    const userCount = await User.countDocuments();
    const role = userCount === 0 ? "SUPER_ADMIN" : "USER";

    const newUser: IUser = await User.create({
      clerkId,
      email: email_addresses[0].email_address,
      profile: {
      firstName: first_name,
      lastName: last_name,
      avatar: image_url
    },
      role,
    });

    console.log("user created succefully", newUser)

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}