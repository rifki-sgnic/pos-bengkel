import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface TopProductsChartProps {
  isLoading: boolean
  topProducts: any[] | undefined
  chartData: any[] | undefined
}

export function TopProductsChart({
  isLoading,
  topProducts,
  chartData,
}: TopProductsChartProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="animate-in rounded-xl border bg-popover/90 p-3 text-popover-foreground shadow-xl ring-1 ring-black/5 backdrop-blur-md duration-150 zoom-in-95 fade-in">
          <p className="text-sm font-semibold">{label}</p>
          <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-primary">
            <span className="size-2 rounded-full bg-primary" />
            Terjual:{" "}
            <span className="text-sm font-bold text-foreground">
              {payload[0].value}
            </span>{" "}
            unit
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <Card className="shadow-sm lg:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div>
          <CardTitle className="text-lg font-bold">Produk Terlaris</CardTitle>
          <p className="mt-0.5 text-xs text-muted-foreground">
            5 produk dengan kuantitas penjualan tertinggi pada periode ini.
          </p>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        {isLoading && (
          <div className="flex flex-col items-center justify-center gap-3 py-20">
            <span className="h-6 w-6 animate-spin rounded-full border-b-2 border-primary" />
            <p className="text-sm text-muted-foreground">
              Memuat data grafik...
            </p>
          </div>
        )}

        {!isLoading && (!topProducts || topProducts.length === 0) && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-2 rounded-full bg-muted p-3">
              <TrendingUp className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              Belum ada data penjualan pada rentang tanggal ini.
            </p>
          </div>
        )}

        {!isLoading && chartData && chartData.length > 0 && (
          <ResponsiveContainer width="100%" height={320} className="outline-hidden">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 10 }}
              style={{ outline: "none" }}
            >
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.3} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                className="stroke-border/40"
              />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
                height={40}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                allowDecimals={false}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={false} // Disable standard Recharts gray overlay highlight on hover
              />
              <Bar
                dataKey="terjual"
                fill="url(#chartGradient)"
                radius={[6, 6, 0, 0]}
                maxBarSize={45}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
