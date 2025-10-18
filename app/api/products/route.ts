// app/api/products/route.ts

import { Types } from "mongoose";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Products"; // adjust path if your models folder differs

export async function POST(req: Request) {
  try {
    await dbConnect();

    const body = await req.json();

    // Required fields validation (basic)
    const required = [
      "product_name",
      "product_description",
      "product_base_price",
      "product_discounted_price",
      "product_brand",
      "product_category",
      "product_images",
      "product_stock",
      "product_sku",
    ];
    for (const k of required) {
      if (body[k] === undefined || body[k] === null || body[k] === "") {
        return NextResponse.json(
          { error: `${k} is required` },
          { status: 400 },
        );
      }
    }

    // Normalize & map incoming fields to schema keys
    const {
      product_name,
      product_description,
      product_base_price,
      product_discounted_price,
      product_discount,
      product_brand,
      product_category,
      product_sub_category,
      product_images,
      product_stock,
      product_reserved_stock = 0,
      product_low_stock_threshold = 10,
      product_sales_count = 0,
      product_sku,
      product_features = [],
      product_specifications = {},
      product_tags = [],
      product_status = "ACTIVE",
      product_is_featured = false,
      product_rating = 0,
    } = body;

    // Basic logical checks
    if (Number(product_reserved_stock) > Number(product_stock)) {
      return NextResponse.json(
        { error: "reservedStock cannot be greater than stock" },
        { status: 400 },
      );
    }

    // Ensure images is an array of strings
    if (!Array.isArray(product_images) || product_images.length === 0) {
      return NextResponse.json({ error: "product_images must be an array" }, { status: 400 });
    }

    // Convert features (from [{value: 'x'}]) to string[] if needed
    const features =
      Array.isArray(product_features) && product_features.length > 0
        ? product_features.map((f: any) => (typeof f === "string" ? f : f?.value)).filter(Boolean)
        : [];

    // Ensure specifications is a plain object
    const specifications =
      product_specifications && typeof product_specifications === "object"
        ? product_specifications
        : {};

    // Normalize tags to lowercase trimmed
    const tags =
      Array.isArray(product_tags)
        ? product_tags.map((t: any) => String(t).trim().toLowerCase()).filter(Boolean)
        : [];

    // Convert category/subcategory to ObjectId if valid; otherwise return 400
    let categoryId: Types.ObjectId | null = null;
    try {
      categoryId = new Types.ObjectId(product_category);
    } catch (err) {
      // If not valid ObjectId, optional: try to look up by slug/name in categories (if you have Category model)
      // For now, return bad request
      return NextResponse.json({ error: "product_category must be a valid ObjectId" }, { status: 400 });
    }

    let subcategoryId: Types.ObjectId | undefined;
    if (product_sub_category) {
      try {
        subcategoryId = new Types.ObjectId(product_sub_category);
      } catch (err) {
        // ignore or return error; here we just skip
        subcategoryId = undefined;
      }
    }

    // Ensure discountedPrice <= basePrice
    let discountedPrice = Number(product_discounted_price);
    let basePrice = Number(product_base_price);
    if (discountedPrice > basePrice) {
      // clamp to base price
      discountedPrice = basePrice;
    }

    // If product_discount missing, compute it
    const discount =
      product_discount !== undefined && product_discount !== null
        ? Number(product_discount)
        : basePrice > 0
        ? Math.round(((basePrice - discountedPrice) / basePrice) * 100 * 100) / 100
        : 0;

    // Build product doc according to your mongoose schema
    const productDoc = {
      name: String(product_name).trim(),
      description: String(product_description).trim(),
      basePrice,
      discountedPrice,
      discount,
      brand: String(product_brand).trim(),
      category: categoryId,
      subcategory: subcategoryId,
      images: product_images,
      stock: Number(product_stock),
      sku: String(product_sku).trim().toUpperCase(),
      lowStockThreshold: Number(product_low_stock_threshold) || 10,
      salesCount: Number(product_sales_count) || 0,
      reservedStock: Number(product_reserved_stock) || 0,
      features,
      specifications, // Map in mongoose will accept plain object
      tags,
      status: ["ACTIVE", "INACTIVE", "OUT_OF_STOCK"].includes(product_status) ? product_status : "ACTIVE",
      isFeatured: Boolean(product_is_featured),
      rating: Number(product_rating) || 0,
    };

    // Create & save
    const created = await Product.create(productDoc);

    return NextResponse.json({ success: true, product: created }, { status: 201 });
  } catch (err: any) {
    console.error("API /api/products error:", err);
    // Duplicate SKU / validation errors handling
    if (err?.code === 11000 && err.keyPattern?.sku) {
      return NextResponse.json({ error: "SKU already exists" }, { status: 409 });
    }
    // Mongoose validation errors
    if (err?.name === "ValidationError") {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const category = searchParams.get("category") || "";
    const isFeatured = searchParams.get("isFeatured");

    const skip = (page - 1) * limit;

    // Build query
    const query: Record<string, unknown> = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
        { sku: { $regex: search, $options: "i" } },
      ];
    }
    
    if (status) {
      query.status = status;
    }
    
    if (category) {
      query.category = category;
    }
    
    if (isFeatured !== null && isFeatured !== undefined) {
      query.isFeatured = isFeatured === "true";
    }

    // Get products with pagination
    const [products, total] = await Promise.all([
      Product.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("category", "name slug")
        .lean(),
      Product.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("❌ Error fetching products:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch products",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    await dbConnect();

    const body = await request.json();
    const { productId, ...updateData } = body;

    if (!productId) {
      return NextResponse.json(
        { success: false, message: "Product ID is required" },
        { status: 400 }
      );
    }

    // If SKU is being updated, check for duplicates
    if (updateData.sku) {
      const existingProduct = await Product.findOne({
        sku: updateData.sku.toUpperCase(),
        _id: { $ne: productId },
      });
      
      if (existingProduct) {
        return NextResponse.json(
          { success: false, message: "Product with this SKU already exists" },
          { status: 409 }
        );
      }
      
      updateData.sku = updateData.sku.toUpperCase();
    }

    const product = await Product.findByIdAndUpdate(
      productId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Product updated successfully",
      data: product,
    });
  } catch (error) {
    console.error("❌ Error updating product:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to update product",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("id");

    if (!productId) {
      return NextResponse.json(
        { success: false, message: "Product ID is required" },
        { status: 400 }
      );
    }

    const product = await Product.findByIdAndDelete(productId);

    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("❌ Error deleting product:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to delete product",
      },
      { status: 500 }
    );
  }
}
