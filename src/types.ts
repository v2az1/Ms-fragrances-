export type UserRole = 'admin' | 'user';

export interface UserProfile {
  uid: string;
  email: string;
  role: UserRole;
  createdAt: string;
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
}

export interface CartItem extends Product {
  quantity: number;
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
