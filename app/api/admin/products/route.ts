import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Products";
import Category from "@/models/Category";
import User from "@/models/User";
import { UserRole } from "@/types/User";

// GET: Fetch all products
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
        { error: `Forbidden - Admin access required. Your role: ${currentUser.role}` },
        { status: 403 }
      );
    }

    // Fetch all products with category info
    const products = await Product.find({})
      .sort({ createdAt: -1 })
      .populate("category", "name slug")
      .lean();

    const totalProducts = await Product.countDocuments({});

    return NextResponse.json({
      products,
      totalProducts,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST: Create a new product
export async function POST(request: NextRequest) {
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
        { error: `Forbidden - Admin access required. Your role: ${currentUser.role}` },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { 
      name, 
      description, 
      basePrice, 
      discountedPrice,
      brand, 
      category, 
      images, 
      stock, 
      sku 
    } = body;

    // Validate required fields
    if (!name || !description || !basePrice || !brand || !category || !sku) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return NextResponse.json(
        { error: "Invalid category" },
        { status: 400 }
      );
    }

    // Check if SKU already exists
    const existingSKU = await Product.findOne({ sku: sku.toUpperCase() });
    if (existingSKU) {
      return NextResponse.json(
        { error: "Product with this SKU already exists" },
        { status: 409 }
      );
    }

    // Create new product
    const newProduct = await Product.create({
      name,
      description,
      basePrice: Number(basePrice),
      discountedPrice: discountedPrice ? Number(discountedPrice) : Number(basePrice),
      brand,
      category,
      images: images || [],
      stock: stock ? Number(stock) : 0,
      sku: sku.toUpperCase(),
      status: stock > 0 ? "ACTIVE" : "OUT_OF_STOCK",
    });

    return NextResponse.json(
      {
        message: "Product created successfully",
        product: newProduct,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating product:", error);
    
    const err = error as { message?: string };
    
    return NextResponse.json(
      { 
        error: "Failed to create product", 
        details: err.message || "Internal server error" 
      },
      { status: 500 }
    );
  }
}
