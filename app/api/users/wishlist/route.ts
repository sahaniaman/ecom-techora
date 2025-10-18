import { getAuth } from "@clerk/nextjs/server";
import {type NextRequest, NextResponse } from "next/server";
import  connectDB from "@/lib/mongodb";
import User, {type IUser } from "@/models/User";

export async function POST(request: NextRequest) {
  try {
    const { userId } = getAuth(request);
    
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { productId, action } = await request.json();

    if (!productId) {
      return NextResponse.json(
        { success: false, message: "Product ID is required" },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findOne({ clerkId: userId });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    let updatedUser: IUser;
    
    if (action === "add") {
      // Add to wishlist if not already present
      if (!user.wishlist.includes(productId)) {
        updatedUser = await User.findByIdAndUpdate(
          user._id,
          { $addToSet: { wishlist: productId } },
          { new: true }
        ).populate("wishlist");
      } else {
        updatedUser = user;
      }
    } else if (action === "remove") {
      // Remove from wishlist
      updatedUser = await User.findByIdAndUpdate(
        user._id,
        { $pull: { wishlist: productId } },
        { new: true }
      ).populate("wishlist");
    } else {
      return NextResponse.json(
        { success: false, message: "Invalid action" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Product ${action === "add" ? "added to" : "removed from"} wishlist`,
      wishlist: updatedUser.wishlist
    });

  } catch (error) {
    console.error("Wishlist API error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = getAuth(request);
    
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const user = await User.findOne({ clerkId: userId }).populate("wishlist");

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      wishlist: user.wishlist || []
    });

  } catch (error) {
    console.error("Get wishlist error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}