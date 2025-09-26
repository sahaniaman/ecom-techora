export interface WishlistItem {
  id: string;
  productId: string;
  userId: string;
  addedAt: Date;
}

export interface Wishlist {
  userId: string;
  items: WishlistItem[];
  updatedAt: Date;
}
