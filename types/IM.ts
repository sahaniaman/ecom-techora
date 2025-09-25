export interface PaymentMethod {
  id: string;
  type: 'CARD' | 'PAYPAL' | 'BANK_TRANSFER';
  isDefault: boolean;
  card?: {
    last4: string;
    brand: string;
    expiryMonth: number;
    expiryYear: number;
  };
  paypalEmail?: string;
  createdAt: Date;
}

export interface WishlistItem {
  productId: string;
  addedAt: Date;
}

export interface Cart {
  userId: string;
  items: CartItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CartItem {
  productId: string;
  variantId?: string;
  quantity: number;
  addedAt: Date;
}

export interface ReturnRequest {
  id: string;
  orderId: string;
  userId: string;
  items: {
    orderItemId: string;
    quantity: number;
    reason: string;
  }[];
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PROCESSED';
  createdAt: Date;
}