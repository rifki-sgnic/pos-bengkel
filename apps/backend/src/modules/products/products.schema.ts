import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(2, "Nama produk minimal 2 karakter"),
  sku: z
    .string()
    .optional()
    .transform((val) => (val === "" ? undefined : val)),
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

export const productQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().optional().default(10),
  search: z.string().optional(),
  sortBy: z
    .enum(["name", "sellPrice", "costPrice", "stock"])
    .optional()
    .default("name"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("asc"),
  type: z.enum(["PART", "JASA"]).optional(),
  categoryId: z.string().uuid().optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type AdjustStockInput = z.infer<typeof adjustStockSchema>;
export type ProductQueryInput = z.infer<typeof productQuerySchema>;
