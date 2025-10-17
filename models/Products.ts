import type { Document, Model, Types } from "mongoose";
import { model, models, Schema } from "mongoose";

export interface IReview {
  reviewBy: Types.ObjectId;
  reviewMessage: string;
  reviewImage?: string[];
  reviewRating: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProduct extends Document {
  name: string;
  description: string;
  basePrice: number;
  discountedPrice: number;
  discount: number; // isko chhod kar aage ka form banao
  brand: string;
  category: Types.ObjectId; // Reference to Category model
  subcategory?: Types.ObjectId; // Reference to Subcategory model
  images: string[];
  stock: number;
  sku: string;
  lowStockThreshold: number;
  salesCount: number;
  reservedStock: number;
  // variants: IVariant[];
  features: string[];
  specifications: Record<string, string>;
  tags: string[];
  status: "ACTIVE" | "INACTIVE" | "OUT_OF_STOCK";
  isFeatured: boolean;
  rating: number;
  reviews: IReview[];
  totalReviews: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IVariant {
  name: string;
  options: {
    value: string;
    price?: number;
    sku?: string;
    stock: number;
    images?: string[];
  }[];
}

const reviewSchema = new Schema<IReview>(
  {
    reviewBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reviewMessage: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    reviewImage: [
      {
        type: String,
        validate: {
          validator: (url: string) => {
            return /^https?:\/\/.+\..+/.test(url);
          },
          message: "Invalid image URL",
        },
      },
    ],
    reviewRating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
  },
  {
    timestamps: true,
  },
);

const variantSchema = new Schema<IVariant>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  options: [
    {
      value: {
        type: String,
        required: true,
        trim: true,
      },
      price: {
        type: Number,
        min: 0,
      },
      sku: {
        type: String,
        trim: true,
      },
      stock: {
        type: Number,
        required: true,
        min: 0,
        default: 0,
      },
      images: [
        {
          type: String,
          validate: {
            validator: (url: string) => {
              return /^https?:\/\/.+\..+/.test(url);
            },
            message: "Invalid image URL",
          },
        },
      ],
    },
  ],
});

const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    basePrice: {
      type: Number,
      required: true,
      min: 0,
    },
    discountedPrice: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: function (this: IProduct, value: number) {
          return value <= this.basePrice;
        },
        message: "Discounted price cannot be greater than base price",
      },
    },
    discount: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 0,
    },
    brand: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    subcategory: {
      type: Schema.Types.ObjectId,
      ref: "Subcategory",
    },
    images: [
      {
        type: String,
        required: true,
        validate: {
          validator: (url: string) => {
            return /^https?:\/\/.+\..+/.test(url);
          },
          message: "Invalid image URL",
        },
      },
    ],
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    sku: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    lowStockThreshold: {
      type: Number,
      required: true,
      min: 0,
      default: 10,
    },
    salesCount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    reservedStock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    // variants: [variantSchema],
    features: [
      {
        type: String,
        trim: true,
      },
    ],
    specifications: {
      type: Map,
      of: String,
      default: {},
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "OUT_OF_STOCK"],
      required: true,
      default: "ACTIVE",
    },
    isFeatured: {
      type: Boolean,
      required: true,
      default: false,
    },
    rating: {
      type: Number,
      required: true,
      min: 0,
      max: 5,
      default: 0,
    },
    reviews: [reviewSchema],
    totalReviews: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

// Pre-save middleware to calculate discounted price and discount percentage
productSchema.pre("save", function (next) {
  if (this.isModified("basePrice") || this.isModified("discountedPrice")) {
    if (this.discountedPrice > this.basePrice) {
      this.discountedPrice = this.basePrice;
    }
    this.discount =
      ((this.basePrice - this.discountedPrice) / this.basePrice) * 100;
  }

  // Auto-update status based on stock
  if (this.stock === 0) {
    this.status = "OUT_OF_STOCK";
  } else if (this.status === "OUT_OF_STOCK" && this.stock > 0) {
    this.status = "ACTIVE";
  }

  next();
});

// Pre-save middleware to update rating when reviews change
productSchema.pre("save", function (next) {
  if (this.reviews.length > 0) {
    const totalRating = this.reviews.reduce(
      (sum, review) => sum + review.reviewRating,
      0,
    );
    this.rating = totalRating / this.reviews.length;
    this.totalReviews = this.reviews.length;
  } else {
    this.rating = 0;
    this.totalReviews = 0;
  }
  next();
});

// Indexes for better performance
productSchema.index({ name: "text", description: "text", tags: "text" });
productSchema.index({ category: 1, status: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ isFeatured: 1, status: 1 });
productSchema.index({ rating: -1, salesCount: -1 });
productSchema.index({ createdAt: -1 });

// Virtual for available stock
productSchema.virtual("availableStock").get(function () {
  return this.stock - this.reservedStock;
});

// Static method to find products by status
productSchema.statics.findByStatus = function (status: string) {
  return this.find({ status });
};

// Static method to find featured products
productSchema.statics.findFeatured = function () {
  return this.find({ isFeatured: true, status: "ACTIVE" });
};

// Instance method to check low stock
productSchema.methods.isLowStock = function () {
  return this.availableStock <= this.lowStockThreshold;
};

const Product: Model<IProduct> =
  models.Product || model<IProduct>("Product", productSchema);

export default Product;
