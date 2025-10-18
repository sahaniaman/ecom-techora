/** biome-ignore-all lint/suspicious/noImplicitAnyLet: explanation */

import { getAuth } from "@clerk/nextjs/server";
import {type NextRequest, NextResponse } from "next/server";
import  connectDB  from "@/lib/mongodb";
import Product from "@/models/Products";
import User from "@/models/User";

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

    const user = await User.findOne({ clerkId: userId });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Get cart items with populated product details
    const cartItems = user.cart || [];
    
    // Fetch product details for each cart item
    const cartItemsWithProducts = await Promise.all(
      cartItems.map(async (item: any) => {
        try {
          const product = await Product.findById(item.productId).select(
            'name images basePrice discountedPrice stock lowStockThreshold'
          );
          
          return {
            productId: item.productId,
            quantity: item.quantity,
            addedAt: item.addedAt,
            product: product ? product.toObject() : null
          };
        } catch (error) {
          console.error(`Error fetching product ${item.productId}:`, error);
          return {
            productId: item.productId,
            quantity: item.quantity,
            addedAt: item.addedAt,
            product: null
          };
        }
      })
    );

    return NextResponse.json({
      success: true,
      data: cartItemsWithProducts
    });

  } catch (error) {
    console.error("Cart API error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// Other methods (POST, PUT, DELETE) भी similarly update करें
export async function POST(request: NextRequest) {
  try {
    const { userId } = getAuth(request);
    
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { productId, quantity = 1 } = await request.json();

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

    // Check if product already exists in cart
    const existingItemIndex = user.cart.findIndex(
      (item: any) => item.productId.toString() === productId
    );

    let updatedUser;

    if (existingItemIndex > -1) {
      // Update quantity if product already in cart
      user.cart[existingItemIndex].quantity += quantity;
      updatedUser = await user.save();
    } else {
      // Add new item to cart
      updatedUser = await User.findOneAndUpdate(
        { clerkId: userId },
        { 
          $push: { 
            cart: { 
              productId, 
              quantity,
              addedAt: new Date()
            } 
          } 
        },
        { new: true }
      );
    }

    // Fetch the updated cart with product details
    const cartItems = updatedUser.cart || [];
    const cartItemsWithProducts = await Promise.all(
      cartItems.map(async (item: any) => {
        try {
          const product = await Product.findById(item.productId).select(
            'name images basePrice discountedPrice stock lowStockThreshold'
          );
          
          return {
            productId: item.productId,
            quantity: item.quantity,
            addedAt: item.addedAt,
            product: product ? product.toObject() : null
          };
        } catch (error) {
          console.error(`Error fetching product ${item.productId}:`, error);
          return {
            productId: item.productId,
            quantity: item.quantity,
            addedAt: item.addedAt,
            product: null
          };
        }
      })
    );

    return NextResponse.json({
      success: true,
      message: "Product added to cart",
      data: cartItemsWithProducts
    });

  } catch (error) {
    console.error("Add to cart API error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId } = getAuth(request);
    
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { productId, quantity } = await request.json();

    if (!productId || !quantity) {
      return NextResponse.json(
        { success: false, message: "Product ID and quantity are required" },
        { status: 400 }
      );
    }

    await connectDB();

    const updatedUser = await User.findOneAndUpdate(
      { 
        clerkId: userId,
        "cart.productId": productId
      },
      { 
        $set: { 
          "cart.$.quantity": quantity 
        } 
      },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, message: "Product not found in cart" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Cart updated",
      cart: updatedUser.cart
    });

  } catch (error) {
    console.error("Update cart API error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = getAuth(request);
    
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { productId } = await request.json();

    await connectDB();

    let updatedUser;

    if (productId) {
      // Remove specific product from cart
      updatedUser = await User.findOneAndUpdate(
        { clerkId: userId },
        { 
          $pull: { 
            cart: { productId } 
          } 
        },
        { new: true }
      );
    } else {
      // Clear entire cart
      updatedUser = await User.findOneAndUpdate(
        { clerkId: userId },
        { $set: { cart: [] } },
        { new: true }
      );
    }

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: productId ? "Product removed from cart" : "Cart cleared",
      cart: updatedUser.cart
    });

  } catch (error) {
    console.error("Remove from cart API error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}