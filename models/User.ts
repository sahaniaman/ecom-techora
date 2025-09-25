import type { Document } from "mongoose";
import mongoose, { Schema } from "mongoose";
import type { Address } from "@/types/Address";
import type { CartItem, PaymentMethod } from "@/types/IM";
import type { UserPreferences, UserProfile } from "@/types/User";
import { UserRole, UserStatus } from "@/types/User";

export interface IUser extends Document {
  clerkId: string;
  email: string;
  phone?: string;
  role?: UserRole;
  status?: UserStatus;
  profile?: UserProfile;
  preferences?: UserPreferences;
  addresses?: Address[];
  paymentMethods?: PaymentMethod[];
  wishlist?: string[];
  cart?: CartItem[];
  orderHistory?: string[];
  createdAt?: Date;
  updatedAt?: Date;
  lastLoginAt?: Date;
  lastActiveAt?: Date;
  emailVerified?: boolean;
  phoneVerified?: boolean;
}

// Sub-schemas - Properly define with default values
const ProfileSchema = new Schema<UserProfile>(
  {
    firstName: { type: String, required: true, trim: true, default: "" },
    lastName: { type: String, required: true, trim: true, default: "" },
    dateOfBirth: { type: Date, default: null },
    avatar: { type: String, default: "" },
    bio: { type: String, default: "" },
  },
  { _id: false }
);

const PreferencesSchema = new Schema<UserPreferences>(
  {
    emailNotifications: { type: Boolean, default: true },
    smsNotifications: { type: Boolean, default: false },
    newsletter: { type: Boolean, default: false },
    language: { type: String, default: "en" },
    currency: { type: String, default: "NPR" },
    theme: { type: String, enum: ["light", "dark", "auto"], default: "auto" },
  },
  { _id: false }
);

const AddressSchema = new Schema(
  { 
    street: { type: String, default: "" },
    city: { type: String, default: "" },
    country: { type: String, default: "" },
    postalCode: { type: String, default: "" }
  },
  { _id: false }
);

const CartItemSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, default: 1, min: 1 },
  },
  { _id: false }
);

const PaymentMethodSchema = new Schema(
  {
    type: { type: String, required: true },
    provider: { type: String, required: true },
    last4: { type: String, required: true },
    expiry: { type: String, required: true },
  },
  { _id: false }
);

// Main schema - Fixed type definitions
const UserSchema = new Schema<IUser>(
   {
    clerkId: { 
      type: String, 
      required: true, 
      unique: true, 
      index: true 
    },
    email: { 
      type: String, 
      required: true, 
      unique: true, 
      lowercase: true,
      index: true
    },
    phone: { type: String, default: "" },

    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER,
    },
    status: {
      type: String,
      enum: Object.values(UserStatus),
      default: UserStatus.ACTIVE,
    },

    // Fixed: Remove required and default from nested schemas
    profile: ProfileSchema,
    preferences: PreferencesSchema,

    addresses: { type: [AddressSchema], default: [] },
    paymentMethods: { type: [PaymentMethodSchema], default: [] },
    wishlist: [{ 
      type: Schema.Types.ObjectId, 
      ref: "Product", 
      default: [] 
    }],
    cart: { type: [CartItemSchema], default: [] },
    orderHistory: [{ 
      type: Schema.Types.ObjectId, 
      ref: "Order", 
      default: [] 
    }],

    lastLoginAt: { type: Date, default: null },
    emailVerified: { type: Boolean, default: false },
    phoneVerified: { type: Boolean, default: false },
  },
  { 
    timestamps: true,
    toJSON: {
      transform: (_: Document, ret: Record<string, unknown>) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret?.__v;
        return ret;
      }
    }
  }
);

// Set default values for nested objects using pre-save middleware
UserSchema.pre('save', function(next) {
  if (!this.profile) {
    this.profile = {
      firstName: "",
      lastName: "",
      dateOfBirth: undefined,
      avatar: "",
      bio: ""
    };
  }

  if (!this.preferences) {
    this.preferences = {
      emailNotifications: true,
      smsNotifications: false,
      newsletter: false,
      language: "en",
      currency: "NPR",
      theme: "auto"
    };
  }

  next();
});

const User = mongoose.models?.User || mongoose.model<IUser>("User", UserSchema);

export default User;