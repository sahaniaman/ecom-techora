import { getAuth } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import type { IProduct } from "@/models/Products";
import Product from "@/models/Products";

// Define interface for product data

// Interface for MongoDB duplicate error
interface MongoError extends Error {
  code?: number;
}

// Interface for Mongoose validation error
interface ValidationError extends Error {
  errors?: Record<string, { message: string }>;
}

export async function POST(request: NextRequest) {
  try {
    // Connect to database
    await dbConnect();

    // Check authentication
    const { userId } = getAuth(request);

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    // Parse request body with type assertion
    const productData = (await request.json()) as IProduct;

    // Validate required fields
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
        {
          success: false,
          message: "Missing required fields",
          missingFields,
        },
        { status: 400 },
      );
    }

    // Calculate discounted price if not provided
    if (!productData.discountedPrice) {
      productData.discountedPrice = productData.basePrice;
    }

    // Calculate discount percentage
    productData.discount =
      ((productData.basePrice - productData.discountedPrice) /
        productData.basePrice) *
      100;

    // Set default values
    const product = new Product({
      ...productData,
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

    // Save product to database
    const savedProduct = await product.save();

    return NextResponse.json(
      {
        success: true,
        message: "Product added successfully",
        data: savedProduct,
      },
      { status: 201 },
    );
  } catch (error: unknown) {
    console.error("Error adding product:", error);

    // Handle duplicate SKU error
    const mongoError = error as MongoError;
    if (mongoError.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          message: "Product with this SKU already exists",
        },
        { status: 400 },
      );
    }

    // Handle validation errors
    const validationError = error as ValidationError;
    if (validationError.name === "ValidationError" && validationError.errors) {
      const errors = Object.values(validationError.errors).map(
        (err) => err.message,
      );
      return NextResponse.json(
        {
          success: false,
          message: "Validation error",
          errors,
        },
        { status: 400 },
      );
    }

    // Generic error handling
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
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

    return NextResponse.json(
      {
        success: true,
        data: products,
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    console.error("Error fetching products:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Error fetching products",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
