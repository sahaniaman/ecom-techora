import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export async function getCurrentUser() {
  const { userId } = await auth();
    console.log("userId              ", userId )
  if (!userId) return null;

  await dbConnect();
const users = await User.find({});
console.log("All users in DB:", users);
  const user = await User.findOne({ clerkId: userId });
  console.log("user        ", user)
  return user ? user.toObject() : null;
}
