import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/mongodb";
import Category from "@/models/Category";

// DELETE: Clear all categories (admin only, for re-initialization)
export async function DELETE() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await dbConnect();

    // Delete all categories
    const result = await Category.deleteMany({});

    return NextResponse.json({
      message: "All categories deleted",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Error deleting categories:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET: Fetch all categories
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await dbConnect();

    // Fetch all active categories
    const categories = await Category.find({ status: "ACTIVE" })
      .sort({ name: 1 })
      .lean();

    return NextResponse.json({
      categories,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
