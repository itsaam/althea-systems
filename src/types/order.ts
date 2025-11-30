export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  shippingAddressId: string;
  billingAddressId: string;
  paymentIntentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface OrderWithItems extends Order {
  items: OrderItem[];
  user: {
    email: string;
    firstName: string;
    lastName: string;
  };
}
