import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import type { Types } from "mongoose";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { UserRole, UserStatus } from "@/types/User";

interface UserDocument {
  _id: Types.ObjectId;
  clerkId?: string;
  email?: string;
  role?: string;
  status?: string;
  createdAt?: Date;
  profile?: {
    firstName?: string;
    lastName?: string;
  };
}

// GET: Fetch all users
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

    // Check if the user is a superadmin
    const currentUser = await User.findOne({ clerkId: userId });
    
    // Debug logging
    console.log("Current user:", {
      clerkId: userId,
      userFound: !!currentUser,
      role: currentUser?.role,
    });
    
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

    // Fetch all users
    const users = await User.find({})
      .sort({ createdAt: -1 })
      .limit(50)
      .select("_id clerkId email profile.firstName profile.lastName role status createdAt")
      .lean<UserDocument[]>();

    // Transform the data to match the expected format
    const transformedUsers = users.map((user) => ({
      id: user._id.toString(),
      name: `${user.profile?.firstName || ""} ${user.profile?.lastName || ""}`.trim() || "N/A",
      email: user.email || "",
      role: user.role || "user",
      createdAt: user.createdAt,
    }));

    const totalUsers = await User.countDocuments({});

    return NextResponse.json({
      users: transformedUsers,
      totalUsers,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST: Create a new user
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

    const body = await request.json();
    const { name, email, password, role } = body;

    // Validate required fields
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    // Check if user already exists in MongoDB
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists in database" },
        { status: 409 }
      );
    }

    // Split name into first and last name
    const nameParts = name.trim().split(" ");
    const firstName = nameParts[0] || "User";
    const lastName = nameParts.slice(1).join(" ") || nameParts[0] || "Account"; // Provide fallback

    // Map role to proper enum value
    let userRole: string;
    switch (role.toLowerCase()) {
      case "superadmin":
      case "super_admin":
        userRole = UserRole.SUPER_ADMIN;
        break;
      case "admin":
        userRole = UserRole.ADMIN;
        break;
      case "vendor":
        userRole = UserRole.VENDOR;
        break;
      case "user":
      default:
        userRole = UserRole.USER;
        break;
    }

    // Step 1: Create user in Clerk
    const client = await clerkClient();
    
    // Log the data being sent for debugging
    console.log("Creating Clerk user with:", {
      email,
      firstName,
      lastName,
      role: userRole,
    });
    
    const clerkUser = await client.users.createUser({
      emailAddress: [email],
      password,
      firstName,
      lastName,
      publicMetadata: {
        role: userRole,
      },
    });

    // Step 2: Create user in MongoDB with Clerk ID
    const newUser = await User.create({
      clerkId: clerkUser.id,
      email,
      role: userRole,
      profile: {
        firstName,
        lastName,
      },
      status: UserStatus.ACTIVE,
      emailVerified: clerkUser.emailAddresses[0]?.verification?.status === "verified",
    });

    return NextResponse.json(
      {
        message: "User created successfully in both Clerk and database",
        user: {
          id: newUser._id.toString(),
          clerkId: clerkUser.id,
          name,
          email,
          role: userRole,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating user:", error);
    
    const err = error as { 
      status?: number; 
      errors?: Array<{ message: string; longMessage?: string; code?: string }>; 
      message?: string;
      clerkError?: boolean;
    };
    
    // Handle specific Clerk errors
    if (err.clerkError && err.errors && Array.isArray(err.errors)) {
      // Log detailed errors for debugging
      console.error("Clerk validation errors:", err.errors);
      
      // Extract error messages
      const errorMessages = err.errors.map(e => e.longMessage || e.message).join(", ");
      
      return NextResponse.json(
        { 
          error: "Validation error from Clerk", 
          details: errorMessages 
        },
        { status: 422 }
      );
    }
    
    // Handle generic validation errors
    if (err.status === 422) {
      return NextResponse.json(
        { 
          error: "Validation error", 
          details: err.message || "Invalid user data" 
        },
        { status: 422 }
      );
    }
    
    // Handle Clerk "already exists" error
    if (err.message?.includes("already exists")) {
      return NextResponse.json(
        { error: "A user with this email already exists" },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { 
        error: "Failed to create user", 
        details: err.message || "Internal server error" 
      },
      { status: 500 }
    );
  }
}
