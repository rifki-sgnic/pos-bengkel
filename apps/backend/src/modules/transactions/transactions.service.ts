import { prisma } from "../../config/database";
import { Prisma } from "../../generated/prisma/client";
import {
  CreateTransactionInput,
  TransactionQueryInput,
  VoidTransactionInput,
} from "./transactions.schema";

async function generateInvoiceNumber(): Promise<string> {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, ""); // 20260709

  const countToday = await prisma.transaction.count({
    where: {
      createdAt: {
        gte: new Date(today.setHours(0, 0, 0, 0)),
      },
    },
  });

  const sequence = String(countToday + 1).padStart(4, "0");

  return `INV-${dateStr}-${sequence}`;
}

export const transactionsService = {
  async create(data: CreateTransactionInput, cashierId: string) {
    // 1. Ambil semua produk yang dipesan sekaligus (hindari N+1 query)
    const productIds = data.items.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    // 2. Validasi tiap item: produk ada, aktif, stok cukup
    for (const item of data.items) {
      const product = products.find((p) => p.id === item.productId);

      if (!product) {
        throw new Error(`Produk dengan ID ${item.productId} tidak ditemukan`);
      }

      if (!product.isActive) {
        throw new Error(`Produk "${product.name}" sudah tidak aktif`);
      }

      if (product.type === "PART" && product.stock < item.quantity) {
        throw new Error(
          `Stok "${product.name}" tidak cukup (tersisa ${product.stock})`,
        );
      }
    }

    // 3. Hitung subtotal & siapkan data item (snapshot harga saat ini)
    let subtotal = 0;
    const itemsData = data.items.map((item) => {
      const product = products.find((p) => p.id === item.productId)!;
      const itemSubtotal = Number(product.sellPrice) * item.quantity;
      subtotal += itemSubtotal;

      return {
        productId: product.id,
        quantity: item.quantity,
        priceAtSale: product.sellPrice,
        subtotal: itemSubtotal,
      };
    });

    const total = subtotal - data.discount + data.tax;
    const invoiceNumber = await generateInvoiceNumber();

    // 4. Semua operasi database dalam 1 transaction (atomic)
    return prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.create({
        data: {
          invoiceNumber,
          customerName: data.customerName,
          customerPhone: data.customerPhone,
          subtotal,
          discount: data.discount,
          tax: data.tax,
          total,
          paymentMethod: data.paymentMethod,
          cashierId,
          items: { create: itemsData },
        },
        include: {
          items: { include: { product: true } },
          cashier: { select: { name: true } },
        },
      });

      // Update stok + catat stock movement, cuma buat produk tipe PART
      for (const item of data.items) {
        const product = products.find((p) => p.id === item.productId)!;
        if (product.type === "PART") {
          await tx.product.update({
            where: { id: product.id },
            data: { stock: { decrement: item.quantity } },
          });

          await tx.stockMovement.create({
            data: {
              productId: product.id,
              userId: cashierId,
              type: "SALE",
              quantity: -item.quantity,
              note: `Transaksi ${invoiceNumber}`,
            },
          });
        }
      }

      return transaction;
    });
  },

  async findAll(query: TransactionQueryInput) {
    const {
      page,
      limit,
      search,
      sortBy,
      sortOrder,
      status,
      paymentMethod,
      startDate,
      endDate,
    } = query;

    const where: Prisma.TransactionWhereInput = {
      ...(status && { status }),
      ...(paymentMethod && { paymentMethod }),
      ...(search && {
        OR: [
          { invoiceNumber: { contains: search, mode: "insensitive" } },
          { customerName: { contains: search, mode: "insensitive" } },
        ],
      }),
      ...((startDate || endDate) && {
        createdAt: {
          ...(startDate && {
            gte: new Date(new Date(startDate).setHours(0, 0, 0, 0)),
          }),
          ...(endDate && {
            lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)),
          }),
        },
      }),
    };

    const [items, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          items: { include: { product: true } },
          cashier: { select: { name: true } },
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.transaction.count({ where }),
    ]);

    return {
      data: items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async findById(id: string) {
    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: {
        items: { include: { product: true } },
        cashier: { select: { name: true } },
      },
    });

    if (!transaction) {
      throw new Error("Transaksi tidak ditemukan");
    }

    return transaction;
  },

  async void(id: string, data: VoidTransactionInput, userId: string) {
    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!transaction) {
      throw new Error("Transaksi tidak ditemukan");
    }
    if (transaction.status === "VOIDED") {
      throw new Error("Transaksi sudah di-void sebelumnya");
    }

    // Void = balikin stok yang tadi udah dikurangi + tandai transaksi sebagai VOIDED
    return prisma.$transaction(async (tx) => {
      const voided = await tx.transaction.update({
        where: { id },
        data: { status: "VOIDED", voidReason: data.voidReason },
      });

      for (const item of transaction.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });
        if (product?.type === "PART") {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });

          await tx.stockMovement.create({
            data: {
              productId: item.productId,
              userId,
              type: "ADJUSTMENT",
              quantity: item.quantity,
              note: `Void transaksi ${transaction.invoiceNumber}`,
            },
          });
        }
      }

      return voided;
    });
  },
};
