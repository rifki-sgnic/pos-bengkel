import { prisma } from "../../config/database";
import { Prisma } from "../../generated/prisma/client";
import {
  AdjustStockInput,
  CreateProductInput,
  ProductQueryInput,
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

  async findAll(query: ProductQueryInput, role: "OWNER" | "CASHIER") {
    const { page, limit, search, sortBy, sortOrder, type, categoryId } = query;

    const where: Prisma.ProductWhereInput = {
      isActive: true,
      ...(type && { type }),
      ...(categoryId && { categoryId }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { sku: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: true },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    const data =
      role === "CASHIER" ? items.map(({ costPrice, ...rest }) => rest) : items;

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
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
