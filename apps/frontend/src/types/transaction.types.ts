import type { Product } from "./product.types"

export type PaymentMethod = "CASH" | "TRANSFER" | "QRIS"
export type TransactionStatus = "COMPLETED" | "VOIDED"

export interface TransactionItem {
  id: string
  quantity: number
  priceAtSale: number
  subtotal: number
  product: Product
}

export interface Transaction {
  id: string
  invoiceNumber: string
  customerName: string | null
  customerPhone: string | null
  subtotal: number
  discount: number
  tax: number
  total: number
  paymentMethod: PaymentMethod
  status: TransactionStatus
  voidReason: string | null
  createdAt: string
  cashier: { name: string }
  items: TransactionItem[]
}

export interface CartItem {
  productId: string
  quantity: number
}

export interface CreateTransactionPayload {
  customerName?: string
  customerPhone?: string
  items: CartItem[]
  discount?: number
  tax?: number
  paymentMethod: PaymentMethod
}
