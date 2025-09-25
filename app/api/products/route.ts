import { getAuth } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import type { IProduct } from "@/models/Products";
import Product from "@/models/Products";
import Category from "@/models/Category";
import mongoose from "mongoose";
import slugify from "slugify";

// Error types
interface MongoError extends Error {
  code?: number;
}
interface ValidationError extends Error {
  errors?: Record<string, { message: string }>;
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    // Clerk auth
    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const productData = (await request.json()) as IProduct;

    // required fields
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

    const missingFields = requiredFields.filter((f) => !productData[f]);
    if (missingFields.length > 0) {
      return NextResponse.json(
        { success: false, message: "Missing required fields", missingFields },
        { status: 400 }
      );
    }

    // --- 🔑 category resolve/create ---
    let categoryId: string;
    const categoryInput = productData.category as unknown as string;

    if (mongoose.isValidObjectId(categoryInput)) {
      categoryId = categoryInput;
    } else {
      const slug = slugify(categoryInput, { lower: true, strict: true });
      let category = await Category.findOne({ slug });

      if (!category) {
        category = await Category.create({
          name: categoryInput,
          slug,
          description: "",
        });
      }

      categoryId = category._id.toString();
    }

    // price/discount calculation
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
      category: categoryId,
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
      { success: false, message: "Internal server error", error: (error as Error).message },
      { status: 500 }
    );
  }
}
