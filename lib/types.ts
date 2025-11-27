export interface User {
  id: string;
  email: string;
  name: string;
  role: "customer" | "admin";
  createdAt: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  materials?: string;
  dimensions?: string;
  weight?: string;
  craftsmanshipTechnique?: string;
  origin?: string | null;
  price: string | number;
  bagType?: string;
  category?: string;
  color?: string;
  colors?: string[];
  stockQuantity?: number;
  stock?: number;
  isAvailable: boolean;
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  domesticDeliveryDays?: number | null;
  internationalDeliveryDays?: number | null;
  averageRating?: string;
  reviewCount?: number;
  createdAt: string;
  updatedAt: string;
  images: Array<{
    id: number;
    productId: number;
    imageUrl: string;
    isPrimary: boolean;
    displayOrder: number;
    createdAt: string;
    updatedAt: string;
  }>;
}

export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  price: number;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  total: number;
}

export interface Address {
  id: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  isDefault: boolean;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  verifiedPurchase: boolean;
  approved: boolean;
  createdAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  totalAmount: number;
  status: "placed" | "confirmed" | "shipped" | "delivered" | "cancelled";
  paymentStatus: "pending" | "completed" | "failed";
  paymentMethod: "mpesa" | "crypto";
  address: Address;
  trackingNumber?: string;
  carrier?: string;
  createdAt: string;
}

export interface PaymentStatus {
  id: string;
  orderId: string;
  status: "pending" | "completed" | "failed";
  method: "mpesa" | "crypto";
  amount: number;
}
