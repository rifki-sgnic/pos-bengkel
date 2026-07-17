import { AlertTriangle, DollarSign, Receipt, TrendingUp } from "lucide-react"
import { useState } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/features/auth/useAuthStore"
import { useLowStockProducts } from "@/features/products/useProductsQuery"
import {
  useReportSummary,
  useTopProducts,
} from "@/features/reports/useReportsQuery"
import { firstDayOfMonthISO, formatRupiah, todayISO } from "@/lib/formatters"
import { useNavigate } from "react-router-dom"

export function DashboardPage() {
  const user = useAuthStore((state) => state.user)
  const isOwner = user?.role === "OWNER"

  const [startDate, setStartDate] = useState(firstDayOfMonthISO())
  const [endDate, setEndDate] = useState(todayISO())
  const navigate = useNavigate()

  const filters = { startDate, endDate }

  const { data: summary, isLoading: summaryLoading } = useReportSummary(filters)
  const { data: topProducts, isLoading: topProductsLoading } = useTopProducts({
    ...filters,
    limit: 5,
  })

  const { data: lowStockProducts, isLoading: lowStockLoading } =
    useLowStockProducts()

  if (!isOwner) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-semibold tracking-tight">
          Selamat datang, {user?.name}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Gunakan menu Kasir (POS) untuk memulai transaksi baru.
        </p>
      </div>
    )
  }

  const chartData = topProducts?.map((p) => ({
    name:
      p.productName.length > 15
        ? p.productName.slice(0, 15) + "..."
        : p.productName,
    terjual: p.totalQuantity,
  }))

  return (
    <div className="space-y-6 p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Ringkasan performa bengkel Anda.
          </p>
        </div>

        <div className="flex gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="startDate" className="text-xs">
              Dari
            </Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-36"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="endDate" className="text-xs">
              Sampai
            </Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-36"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Omzet
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">
              {summaryLoading
                ? "..."
                : formatRupiah(summary?.totalRevenue ?? 0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Jumlah Transaksi
            </CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">
              {summaryLoading ? "..." : (summary?.totalTransactions ?? 0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Laba Kotor
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">
              {summaryLoading ? "..." : formatRupiah(summary?.grossProfit ?? 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Produk Terlaris</CardTitle>
        </CardHeader>
        <CardContent>
          {topProductsLoading && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Memuat data...
            </p>
          )}

          {!topProductsLoading &&
            (!topProducts || topProducts.length === 0) && (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Belum ada data penjualan pada rentang ini.
              </p>
            )}

          {chartData && chartData.length > 0 && (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  className="stroke-border"
                />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  angle={-15}
                  textAnchor="end"
                  height={60}
                />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                    fontSize: "13px",
                  }}
                />
                <Bar
                  dataKey="terjual"
                  fill="var(--primary)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {lowStockProducts && lowStockProducts.length > 0 && (
        <Card className="border-destructive/30 bg-destructive/3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-destructive">
              <AlertTriangle className="h-4 w-4" />
              Stok Menipis
              <Badge variant="destructive" className="ml-auto">
                {lowStockProducts.length} produk
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lowStockProducts.slice(0, 5).map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between border-b border-dashed py-1.5 text-sm last:border-0"
                >
                  <span className="font-medium">{product.name}</span>
                  <span className="text-muted-foreground">
                    Sisa{" "}
                    <span className="font-semibold text-destructive">
                      {product.stock}
                    </span>{" "}
                    / min. {product.minStock}
                  </span>
                </div>
              ))}
            </div>

            {lowStockProducts.length > 5 && (
              <p className="mt-2 text-xs text-muted-foreground">
                +{lowStockProducts.length - 5} produk lainnya
              </p>
            )}

            <Button
              variant="outline"
              size="sm"
              className="mt-3 w-full"
              onClick={() => navigate("/products")}
            >
              Kelola Stok
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
