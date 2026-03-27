export type UserRole = 'admin' | 'user';

export interface UserProfile {
  uid: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface ProductVariant {
  size: string; // e.g., "125ml"
  price: number;
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
  stock: number;
  createdAt: string;
  variants?: ProductVariant[];
}

export interface CartItem extends Product {
  quantity: number;
  selectedVariant?: ProductVariant;
}

export interface Order {
  id: string;
  userId: string;
  products: CartItem[];
  totalPrice: number;
  customerName: string;
  phone: string;
  address: string;
  notes?: string;
  status: 'Ordered' | 'Confirmed' | 'Out for Delivery' | 'Delivered';
  createdAt: string;
}
