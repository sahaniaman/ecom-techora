import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Category from "@/models/Category";

export async function GET() {
  try {
    await dbConnect();

    const categories = await Category.find({ status: "ACTIVE" })
      .select("_id name slug")
      .sort({ name: 1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("❌ Error fetching categories:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch categories",
      },
      { status: 500 }
    );
  }
}
