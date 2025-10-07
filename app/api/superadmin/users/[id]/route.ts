import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import type { Types } from "mongoose";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import type { Address } from "@/types/Address";
import { UserRole, type UserPreferences, type UserProfile } from "@/types/User";

interface UserDetailDocument {
  _id: Types.ObjectId;
  clerkId?: string;
  email?: string;
  phone?: string;
  role?: string;
  status?: string;
  profile?: UserProfile;
  preferences?: UserPreferences;
  addresses?: Address[];
  createdAt?: Date;
  updatedAt?: Date;
  lastLoginAt?: Date;
  emailVerified?: boolean;
  phoneVerified?: boolean;
}

interface RouteParams {
  params: {
    id: string;
  };
}

// GET: Fetch a single user by ID
export async function GET(
  _request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await dbConnect();

    // Check if the user is a superadmin
    const currentUser = await User.findOne({ clerkId: userId });
    
    if (!currentUser) {
      return NextResponse.json(
        { error: "User not found in database" },
        { status: 403 }
      );
    }
    
    // Check for both SUPER_ADMIN and superadmin for flexibility
    const isSuperAdmin = 
      currentUser.role === UserRole.SUPER_ADMIN || 
      currentUser.role === "SUPER_ADMIN" ||
      currentUser.role === "superadmin";
      
    if (!isSuperAdmin) {
      return NextResponse.json(
        { error: `Forbidden - Superadmin access required. Your role: ${currentUser.role}` },
        { status: 403 }
      );
    }

    const { id } = params;

    // Fetch the user
    const user = await User.findById(id).lean<UserDetailDocument>();

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Transform the data
    const transformedUser = {
      id: user._id.toString(),
      clerkId: user.clerkId,
      name: `${user.profile?.firstName || ""} ${user.profile?.lastName || ""}`.trim() || "N/A",
      email: user.email,
      phone: user.phone,
      role: user.role || "user",
      status: user.status || "active",
      profile: user.profile,
      preferences: user.preferences,
      addresses: user.addresses,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastLoginAt: user.lastLoginAt,
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,
    };

    return NextResponse.json({ user: transformedUser });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT: Update a user
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await dbConnect();

    // Check if the user is a superadmin
    const currentUser = await User.findOne({ clerkId: userId });
    
    if (!currentUser) {
      return NextResponse.json(
        { error: "User not found in database" },
        { status: 403 }
      );
    }
    
    // Check for both SUPER_ADMIN and superadmin for flexibility
    const isSuperAdmin = 
      currentUser.role === UserRole.SUPER_ADMIN || 
      currentUser.role === "SUPER_ADMIN" ||
      currentUser.role === "superadmin";
      
    if (!isSuperAdmin) {
      return NextResponse.json(
        { error: `Forbidden - Superadmin access required. Your role: ${currentUser.role}` },
        { status: 403 }
      );
    }

    const { id } = params;
    const body = await request.json();

    // Update the user
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    ).lean();

    if (!updatedUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE: Delete a user
export async function DELETE(
  _request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await dbConnect();

    // Check if the user is a superadmin
    const currentUser = await User.findOne({ clerkId: userId });
    
    if (!currentUser) {
      return NextResponse.json(
        { error: "User not found in database" },
        { status: 403 }
      );
    }
    
    // Check for both SUPER_ADMIN and superadmin for flexibility
    const isSuperAdmin = 
      currentUser.role === UserRole.SUPER_ADMIN || 
      currentUser.role === "SUPER_ADMIN" ||
      currentUser.role === "superadmin";
      
    if (!isSuperAdmin) {
      return NextResponse.json(
        { error: `Forbidden - Superadmin access required. Your role: ${currentUser.role}` },
        { status: 403 }
      );
    }

    const { id } = params;

    // Delete the user
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
