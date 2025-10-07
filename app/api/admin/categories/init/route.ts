import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/mongodb";
import Category from "@/models/Category";
import User from "@/models/User";
import { UserRole } from "@/types/User";

// POST: Create initial categories (for testing/setup)
export async function POST() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await dbConnect();

    // Check if the user is an admin or superadmin
    const currentUser = await User.findOne({ clerkId: userId });
    
    if (!currentUser) {
      return NextResponse.json(
        { error: "User not found in database" },
        { status: 403 }
      );
    }
    
    const isAdmin = 
      currentUser.role === UserRole.ADMIN ||
      currentUser.role === UserRole.SUPER_ADMIN ||
      currentUser.role === "ADMIN" ||
      currentUser.role === "SUPER_ADMIN";
      
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    // Check if categories already exist
    const existingCount = await Category.countDocuments({});
    
    if (existingCount > 0) {
      return NextResponse.json(
        { message: "Categories already exist", count: existingCount },
        { status: 200 }
      );
    }

    // Create initial categories
    const initialCategories = [
      { name: "Mobile Accessories", slug: "mobile-accessories", description: "Phone cases, chargers, screen protectors and more" },
      { name: "Premium Phones", slug: "premium-phones", description: "High-end flagship smartphones" },
      { name: "Refurbished Phones", slug: "refurbished-phones", description: "Certified refurbished smartphones" },
      { name: "Gadgets", slug: "gadgets", description: "Smart devices and tech gadgets" },
    ];

    const categories = await Category.insertMany(initialCategories);

    return NextResponse.json(
      {
        message: "Initial categories created successfully",
        categories,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating initial categories:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
