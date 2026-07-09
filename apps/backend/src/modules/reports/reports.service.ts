import { prisma } from "../../config/database";
import { ReportFilterInput, TopProductsFilterInput } from "./reports.schema";

function getDateRange(startDate: string, endDate: string) {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);

  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

export const reportsService = {
  async getSummary(filters: ReportFilterInput) {
    const { start, end } = getDateRange(filters.startDate, filters.endDate);

    // Ambil semua transaksi COMPLETED dalam rentang tanggal, termasuk item + produknya
    // (butuh detail item karena laba kotor dihitung per item, bukan per transaksi)
    const transactions = await prisma.transaction.findMany({
      where: {
        status: "COMPLETED",
        createdAt: { gte: start, lte: end },
      },
      include: {
        items: { include: { product: true } },
      },
    });

    let totalRevenue = 0;
    let grossProfit = 0;

    for (const trx of transactions) {
      totalRevenue += Number(trx.total);

      for (const item of trx.items) {
        const costPrice = Number(item.product.costPrice);
        const priceAtSale = Number(item.priceAtSale);
        grossProfit += (priceAtSale - costPrice) * item.quantity;
      }
    }

    return {
      totalRevenue,
      totalTransactions: transactions.length,
      grossProfit,
      period: { startDate: filters.startDate, endDate: filters.endDate },
    };
  },

  async getTopProducts(filters: TopProductsFilterInput) {
    const { start, end } = getDateRange(filters.startDate, filters.endDate);

    // groupBy TransactionItem berdasarkan productId, jumlahin quantity & subtotal
    // filter transaksi COMPLETED lewat relasi `transaction`
    const grouped = await prisma.transactionItem.groupBy({
      by: ["productId"],
      where: {
        transaction: {
          status: "COMPLETED",
          createdAt: { gte: start, lte: end },
        },
      },
      _sum: {
        quantity: true,
        subtotal: true,
      },
      orderBy: {
        _sum: { quantity: "desc" },
      },
      take: filters.limit,
    });

    // groupBy Prisma gak bisa langsung include relasi produk, jadi ambil manual lalu di-map
    const productIds = grouped.map((g) => g.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    return grouped.map((g) => {
      const product = products.find((p) => p.id === g.productId);
      return {
        productId: g.productId,
        productName: product?.name ?? "Produk tidak ditemukan",
        totalQuantity: g._sum.quantity ?? 0,
        totalRevenue: Number(g._sum.subtotal ?? 0),
      };
    });
  },
};
