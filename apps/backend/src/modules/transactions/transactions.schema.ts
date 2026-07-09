import { z } from "zod";

const transactionItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive("Quantity harus lebih dari 0"),
});

export const createTransactionSchema = z.object({
  customerName: z.string().optional(),
  customerPhone: z.string().optional(),
  items: z.array(transactionItemSchema).min(1, "Minimal harus ada 1 item"),
  discount: z.number().nonnegative().optional().default(0),
  tax: z.number().nonnegative().optional().default(0),
  paymentMethod: z.enum(["CASH", "TRANSFER", "QRIS"]),
});

export const voidTransactionSchema = z.object({
  voidReason: z.string().min(5, "Alasan void minimal 5 karakter"),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type VoidTransactionInput = z.infer<typeof voidTransactionSchema>;
