import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().min(2, "Nama kategori minimal 2 karakter"),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
