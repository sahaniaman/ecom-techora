import { Address } from "./Address";

export enum ProductCategory {
  MOBILE_ACCESSORIES = "mobile-accessories",
  PREMIUM_PHONES = "premium-phones",
  REFURBISHED_PHONES = "refurbished-phones",
  GADGETS = "gadgets",
}


export interface ProductVariant {
  id: string;
  name: string;
  price: number;
  sku: string;
  stock: number;
  attributes: Record<string, string>; // { color: "red", size: "XL" }
  images: string[];
}

export interface Product {
  id: string
  name: string
  description: string
  basePrice: number
  discountedPrice: number
  discount: number
  category: ProductCategory
  subcategory?: string
  images: string[]

  // Stock management
  stock: number                    // ✅ YEH ADD KARNA BHOOL GAYA THA
  sku: string                     // Stock Keeping Unit
  lowStockThreshold: number       // Jab stock 5 se kam ho to alert

  // Sales tracking
  salesCount: number              // Kitne beche gaye
  reservedStock: number           // Orders mein reserved stock

  variants: ProductVariant[]
  brand: string
  features: string[]
  specifications: Record<string, string>
  tags: string[]

  status: 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK'
  isFeatured: boolean

  // Ratings
  rating: number
  reviewCount: number

  createdAt: Date
  updatedAt: Date
}

export interface OrderItem {
  id: string;
  productId: string;
  variantId?: string;
  quantity: number;
  price: number; // Price at time of purchase
  productSnapshot: {
    name: string;
    image: string;
    sku: string;
  };
}

export interface Order {
  id: string;
  orderNumber: string; // Human-readable: ORD-2024-001
  userId: string;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  shippingAddress: Address;
  billingAddress: Address;
  paymentMethod: string;
  trackingNumber?: string;
  carrier?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum OrderStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  PROCESSING = "PROCESSING",
  SHIPPED = "SHIPPED",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
  RETURNED = "RETURNED",
}

export enum PaymentStatus {
  PENDING = "PENDING",
  PAID = "PAID",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED",
  PARTIALLY_REFUNDED = "PARTIALLY_REFUNDED",
}
