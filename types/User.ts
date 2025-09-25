import { Address } from "./Address";
import { CartItem, PaymentMethod } from "./IM";

export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
  SUPER_ADMIN = "SUPER_ADMIN",
  VENDOR = "VENDOR", // If you have multiple sellers
}

export enum UserStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  SUSPENDED = "SUSPENDED",
  PENDING_VERIFICATION = "PENDING_VERIFICATION",
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  dateOfBirth?: Date;
  avatar?: string;
  bio?: string;
}

export interface UserPreferences {
  emailNotifications: boolean;
  smsNotifications: boolean;
  newsletter: boolean;
  language: string;
  currency: string;
  theme: 'light' | 'dark' | 'auto';
}

export interface User {
  id: string;
  email: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  profile: UserProfile;
  preferences: UserPreferences;
  addresses: Address[];
  paymentMethods?: PaymentMethod[];
  wishlist: string[]; // Product IDs
  cart: CartItem[];
  orderHistory: string[]; // Order IDs
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  emailVerified: boolean;
  phoneVerified: boolean;
}