import { z } from "zod";

export const reportFilterSchema = z.object({
  startDate: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), "startDate tidak valid"),
  endDate: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), "endDate tidak valid"),
});

export const topProductsFilterSchema = reportFilterSchema.extend({
  limit: z.coerce.number().int().positive().optional().default(10),
});

export type ReportFilterInput = z.infer<typeof reportFilterSchema>;
export type TopProductsFilterInput = z.infer<typeof topProductsFilterSchema>;
