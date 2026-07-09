import { prisma } from "../../config/database";
import {
  AdjustStockInput,
  CreateProductInput,
  UpdateProductInput,
} from "./products.schema";

export const productsService = {
  async create(data: CreateProductInput) {
    if (data.sku) {
      const existing = await prisma.product.findUnique({
        where: { sku: data.sku },
      });
      if (existing) {
        throw new Error("SKU sudah digunakan");
      }
    }

    // JASA gak butuh stok, paksa jadi 0 apapun inputnya
    const stock = data.type === "JASA" ? 0 : (data.stock ?? 0);

    return prisma.product.create({
      data: { ...data, stock },
    });
  },

  async findAll(role: "OWNER" | "CASHIER") {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      include: { category: true },
      orderBy: { name: "asc" },
    });

    if (role === "CASHIER") {
      return products.map(({ costPrice, ...rest }) => rest);
    }

    return products;
  },

  async findById(id: string, role: "OWNER" | "CASHIER") {
    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!product) {
      throw new Error("Produk tidak ditemukan");
    }

    if (role === "CASHIER") {
      const { costPrice, ...rest } = product;
      return rest;
    }

    return product;
  },

  async update(id: string, data: UpdateProductInput) {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw new Error("Produk tidak ditemukan");
    }
    return prisma.product.update({ where: { id }, data });
  },

  // Soft delete
  async deactivate(id: string) {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw new Error("Produk tidak ditemukan");
    }
    return prisma.product.update({ where: { id }, data: { isActive: false } });
  },

  async adjustStock(productId: string, userId: string, data: AdjustStockInput) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      throw new Error("Produk tidak ditemukan");
    }
    if (product.type === "JASA") {
      throw new Error("Jasa tidak memiliki stok");
    }

    const newStock = product.stock + data.quantity;
    if (newStock < 0) {
      throw new Error("Stok tidak boleh minus");
    }

    // Transaction: update stok + catat pergerakan stok dalam 1 operasi atomik
    // Kalau salah satu gagal, dua-duanya di-rollback
    return prisma.$transaction([
      prisma.product.update({
        where: { id: productId },
        data: { stock: newStock },
      }),
      prisma.stockMovement.create({
        data: {
          productId,
          userId,
          type: data.quantity > 0 ? "RESTOCK" : "ADJUSTMENT",
          quantity: data.quantity,
          note: data.note,
        },
      }),
    ]);
  },

  async getLowStock() {
    const products = await prisma.product.findMany({
      where: { type: "PART", isActive: true },
    });
    return products.filter((p) => p.stock <= p.minStock);
  },
};
