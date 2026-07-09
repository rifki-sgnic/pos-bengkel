import { prisma } from "../../config/database";
import { CreateCategoryInput } from "./categories.schema";

export const categoriesService = {
  async create(data: CreateCategoryInput) {
    const existing = await prisma.category.findUnique({
      where: { name: data.name },
    });
    if (existing) {
      throw new Error("Kategori sudah ada");
    }
    return prisma.category.create({ data });
  },

  async findAll() {
    return prisma.category.findMany({ orderBy: { name: "asc" } });
  },

  async delete(id: string) {
    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) {
      throw new Error("Kategori tidak ditemukan");
    }
    return prisma.category.delete({ where: { id } });
  },
};
