export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  images: string[];
  isActive: boolean;
  categoryId: string | null;
  category?: Category | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  _count?: { products: number };
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: "USER" | "ADMIN";
  isActive: boolean;
  emailVerified: Date | null;
  loginAttempts: number;
  lockUntil: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  id: string;
  totalAmount: number;
  status: OrderStatus;
  userId: string;
  user?: { name: string | null; email: string };
  items?: OrderItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  orderId: string;
  productId: string;
  product?: { name: string; images: string[] };
}

export type OrderStatus = "PENDING" | "PAID" | "SHIPPED" | "DELIVERED" | "CANCELLED";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}
