import { useState } from "react"
import { DollarSign, Receipt, TrendingUp } from "lucide-react"
import { useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/features/auth/useAuthStore"
import { useLowStockProducts } from "@/features/products/useProductsQuery"
import {
  useReportSummary,
  useTopProducts,
} from "@/features/reports/useReportsQuery"
import { firstDayOfMonthISO, formatRupiah, todayISO } from "@/lib/formatters"

import { DashboardHeader } from "@/components/dashboard/DashboardHeader"
import { KpiCard } from "@/components/dashboard/KpiCard"
import { TopProductsChart } from "@/components/dashboard/TopProductsChart"
import { LowStockAlert } from "@/components/dashboard/LowStockAlert"

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
      <div className="flex min-h-[80vh] animate-in flex-col items-center justify-center p-8 text-center duration-500 fade-in">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-8 ring-primary/5">
          <TrendingUp className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight">
          Selamat datang, {user?.name}!
        </h1>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
          Sistem Kasir Bengkel siap digunakan. Silakan buka menu Kasir (POS) di
          sidebar untuk mulai mencatat transaksi penjualan baru.
        </p>
        <Button
          className="mt-6 px-6 font-medium shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl active:scale-95"
          onClick={() => navigate("/pos")}
        >
          Mulai Transaksi Baru
        </Button>
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
    <div className="animate-in space-y-8 p-8 duration-500 fade-in">
      {/* Header Section */}
      <DashboardHeader
        userName={user?.name}
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
      />

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <KpiCard
          title="Total Omzet"
          value={formatRupiah(summary?.totalRevenue ?? 0)}
          subtext="Total pendapatan kotor"
          icon={DollarSign}
          isLoading={summaryLoading}
          accentColor="emerald"
        />

        <KpiCard
          title="Jumlah Transaksi"
          value={summary?.totalTransactions ?? 0}
          subtext="Transaksi tercatat"
          icon={Receipt}
          isLoading={summaryLoading}
          accentColor="blue"
        />

        <KpiCard
          title="Laba Kotor"
          value={formatRupiah(summary?.grossProfit ?? 0)}
          subtext="Selisih harga jual & modal"
          icon={TrendingUp}
          isLoading={summaryLoading}
          accentColor="indigo"
        />
      </div>

      {/* Main Grid: Chart & Low Stock */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <TopProductsChart
          isLoading={topProductsLoading}
          topProducts={topProducts}
          chartData={chartData}
        />

        <LowStockAlert
          isLoading={lowStockLoading}
          lowStockProducts={lowStockProducts}
          onNavigate={() => navigate("/products")}
        />
      </div>
    </div>
  )
}
