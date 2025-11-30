export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "cancelled";

export interface Invoice {
  id: string;
  orderId: string;
  number: string;
  status: InvoiceStatus;
  subtotal: number;
  tax: number;
  total: number;
  dueDate: Date;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Credit {
  id: string;
  userId: string;
  orderId?: string;
  invoiceId?: string;
  amount: number;
  reason: string;
  status: "pending" | "applied" | "expired";
  expiresAt?: Date;
  createdAt: Date;
}
