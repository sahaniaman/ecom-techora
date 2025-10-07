import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export async function getCurrentUser() {
  const { userId } = await auth();

  if (!userId) return null;

  await dbConnect();
  const user = await User.findOne({ clerkId: userId });
  return user ? user.toObject() : null;
}


