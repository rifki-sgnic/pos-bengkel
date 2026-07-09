import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(2, "Nama produk minimal 2 karakter"),
  sku: z.string().optional(),
  type: z.enum(["PART", "JASA"]),
  costPrice: z.number().nonnegative("Harga modal tidak boleh negatif"),
  sellPrice: z.number().positive("Harga jual harus lebih dari 0"),
  stock: z.number().int().nonnegative().optional().default(0),
  minStock: z.number().int().nonnegative().optional().default(5),
  categoryId: z.string().uuid().optional(),
});

export const updateProductSchema = createProductSchema.partial();

export const adjustStockSchema = z.object({
  quantity: z.number().int("Quantity harus bilangan bulat"),
  note: z.string().optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type AdjustStockInput = z.infer<typeof adjustStockSchema>;
