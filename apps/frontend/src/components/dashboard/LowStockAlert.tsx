import { AlertTriangle, TrendingUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface LowStockAlertProps {
  isLoading: boolean
  lowStockProducts: any[] | undefined
  onNavigate: () => void
}

export function LowStockAlert({
  isLoading,
  lowStockProducts,
  onNavigate,
}: LowStockAlertProps) {
  return (
    <Card className="border-destructive/20 bg-destructive/1 shadow-sm dark:bg-destructive/3">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base font-bold text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Stok Menipis
          </CardTitle>
          {lowStockProducts && lowStockProducts.length > 0 && (
            <Badge
              variant="destructive"
              className="rounded-full text-xs font-semibold"
            >
              {lowStockProducts.length} Produk
            </Badge>
          )}
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Daftar produk dengan kuantitas stok di bawah batas minimal.
        </p>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        {isLoading && (
          <div className="space-y-4 py-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="space-y-2">
                <div className="h-4 w-32 animate-pulse rounded-md bg-muted" />
                <div className="h-2 w-full animate-pulse rounded-full bg-muted" />
              </div>
            ))}
          </div>
        )}

        {!isLoading &&
          (!lowStockProducts || lowStockProducts.length === 0) && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-2 rounded-full bg-emerald-500/10 p-3 text-emerald-600">
                <TrendingUp className="h-6 w-6" />
              </div>
              <p className="text-sm font-semibold text-emerald-600">
                Semua stok aman!
              </p>
              <p className="mt-1 max-w-[200px] text-xs text-muted-foreground">
                Tidak ada produk dengan stok di bawah batas minimum.
              </p>
            </div>
          )}

        {!isLoading &&
          lowStockProducts &&
          lowStockProducts.length > 0 && (
            <div className="space-y-4">
              <div className="max-h-[260px] space-y-3.5 overflow-y-auto pr-1">
                {lowStockProducts.slice(0, 5).map((product) => {
                  const percentage = Math.min(
                    100,
                    (product.stock / product.minStock) * 100
                  )
                  const isCritical = product.stock === 0
                  return (
                    <div key={product.id} className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="max-w-[150px] truncate font-semibold text-foreground">
                          {product.name}
                        </span>
                        <span className="font-mono text-[10px] text-muted-foreground">
                          Sisa:{" "}
                          <span
                            className={
                              isCritical
                                ? "text-xs font-bold text-destructive"
                                : "text-xs font-bold text-amber-500"
                            }
                          >
                            {product.stock}
                          </span>{" "}
                          / {product.minStock} pcs
                        </span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/60">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isCritical
                              ? "bg-destructive"
                              : product.stock <= product.minStock / 2
                                ? "bg-red-500"
                                : "bg-amber-500"
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>

              {lowStockProducts.length > 5 && (
                <p className="pt-1 text-center text-xs text-muted-foreground">
                  +{lowStockProducts.length - 5} produk menipis lainnya
                </p>
              )}

              <Button
                variant="outline"
                size="sm"
                className="hover:text-destructive-foreground mt-2 w-full rounded-xl font-medium transition-colors hover:border-destructive hover:bg-destructive"
                onClick={onNavigate}
              >
                Kelola Stok
              </Button>
            </div>
          )}
      </CardContent>
    </Card>
  )
}
