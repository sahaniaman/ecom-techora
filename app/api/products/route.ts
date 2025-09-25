import { getAuth } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import type { IProduct } from "@/models/Products";
import Product from "@/models/Products";
import Category from "@/models/Category";
import mongoose from "mongoose";

// Define interface for product data
interface MongoError extends Error {
  code?: number;
}

interface ValidationError extends Error {
  errors?: Record<string, { message: string }>;
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    // Clerk auth check
    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const productData = (await request.json()) as IProduct;

    // required fields check
    const requiredFields = [
      "name",
      "description",
      "basePrice",
      "brand",
      "category",
      "images",
      "stock",
      "sku",
      "features",
      "specifications",
    ] as const;

    const missingFields = requiredFields.filter((field) => !productData[field]);
    if (missingFields.length > 0) {
      return NextResponse.json(
        { success: false, message: "Missing required fields", missingFields },
        { status: 400 }
      );
    }

    // --- 🔑 category resolve logic ---
    let categoryId: string;
    const categoryIdentifier = productData.category as unknown as string;

    if (mongoose.isValidObjectId(categoryIdentifier)) {
      categoryId = categoryIdentifier;
    } else {
      const cat = await Category.findOne({
        $or: [{ slug: categoryIdentifier }, { name: categoryIdentifier }],
      });

      if (!cat) {
        return NextResponse.json(
          { success: false, message: "Category not found" },
          { status: 400 }
        );
      }
      categoryId = cat._id.toString();
    }

    // calculate discounted price & discount
    if (!productData.discountedPrice) {
      productData.discountedPrice = productData.basePrice;
    }
    productData.discount =
      ((productData.basePrice - productData.discountedPrice) /
        productData.basePrice) *
      100;

    // create product
    const product = new Product({
      ...productData,
      category: categoryId, // 👈 assign resolved category id
      salesCount: productData.salesCount || 0,
      reservedStock: productData.reservedStock || 0,
      lowStockThreshold: productData.lowStockThreshold || 10,
      status: productData.status || "ACTIVE",
      isFeatured: productData.isFeatured || false,
      rating: 0,
      reviews: [],
      totalReviews: 0,
      tags: productData.tags || [],
      variants: productData.variants || [],
    });

    const savedProduct = await product.save();

    return NextResponse.json(
      { success: true, message: "Product added successfully", data: savedProduct },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Error adding product:", error);

    const mongoError = error as MongoError;
    if (mongoError.code === 11000) {
      return NextResponse.json(
        { success: false, message: "Product with this SKU already exists" },
        { status: 400 }
      );
    }

    const validationError = error as ValidationError;
    if (validationError.name === "ValidationError" && validationError.errors) {
      const errors = Object.values(validationError.errors).map((err) => err.message);
      return NextResponse.json(
        { success: false, message: "Validation error", errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await dbConnect();
    const products = await Product.find({})
      .populate("category")
      .populate("subcategory")
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: products }, { status: 200 });
  } catch (error: unknown) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error fetching products",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
