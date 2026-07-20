import { Search, Plus, Minus, Package, Wrench } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Category, Product, ProductType } from "@/types/product.types"
import { formatRupiah } from "@/lib/formatters"

type TypeTab = "ALL" | ProductType

interface ProductCatalogProps {
  search: string
  onSearchChange: (value: string) => void
  typeTab: TypeTab
  onTypeTabChange: (tab: TypeTab) => void
  categoryId: string | undefined
  onCategoryIdChange: (id: string | undefined) => void
  categories: Category[] | undefined
  products: Product[]
  isLoading: boolean
  cartQuantityFor: (id: string) => number
  handleAddToCart: (id: string) => void
  updateQuantity: (id: string, qty: number) => void
}

export function ProductCatalog({
  search,
  onSearchChange,
  typeTab,
  onTypeTabChange,
  categoryId,
  onCategoryIdChange,
  categories,
  products,
  isLoading,
  cartQuantityFor,
  handleAddToCart,
  updateQuantity,
}: ProductCatalogProps) {
  return (
    <div className="flex h-full min-h-0 animate-in flex-col gap-5 overflow-hidden p-6 duration-500 fade-in">
      {/* Header Kasir */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Kasir (POS)</h1>
        <p className="text-sm text-muted-foreground">
          Pilih produk dan jasa di bawah untuk mencatat transaksi penjualan.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari produk atau SKU..."
            className="h-10 rounded-xl border pl-9 shadow-xs focus-visible:ring-1"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        {/* Type Tab Filter */}
        <div className="inline-flex w-fit gap-1 rounded-xl border bg-muted/70 p-1 shadow-xs">
          {(["ALL", "PART", "JASA"] as TypeTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => onTypeTabChange(tab)}
              className={`cursor-pointer rounded-lg px-4 py-1.5 text-xs font-semibold transition-all duration-200 ${
                typeTab === tab
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab === "ALL" ? "Semua" : tab === "PART" ? "Sparepart" : "Jasa"}
            </button>
          ))}
        </div>
      </div>

      {/* Category Filter Horizontal Scroll */}
      {categories && categories.length > 0 && (
        <div className="-mx-1 flex scrollbar-none gap-2 overflow-x-auto px-1 pb-1">
          <button
            onClick={() => onCategoryIdChange(undefined)}
            className={`shrink-0 cursor-pointer rounded-full border px-4 py-1.5 text-xs font-semibold transition-all duration-200 ${
              !categoryId
                ? "border-primary bg-primary text-primary-foreground shadow-sm"
                : "border-border text-muted-foreground hover:border-foreground/30"
            }`}
          >
            Semua Kategori
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onCategoryIdChange(cat.id)}
              className={`shrink-0 cursor-pointer rounded-full border px-4 py-1.5 text-xs font-semibold transition-all duration-200 ${
                categoryId === cat.id
                  ? "border-primary bg-primary text-primary-foreground shadow-sm"
                  : "border-border text-muted-foreground hover:border-foreground/30"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {/* Product Cards Grid Container */}
      <ScrollArea className="min-h-0 flex-1 pr-1">
        <div className="grid grid-cols-2 gap-4 pb-4 md:grid-cols-3 xl:grid-cols-4">
          {isLoading &&
            Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="h-36 animate-pulse rounded-2xl border bg-muted"
              />
            ))}

          {!isLoading && products.length === 0 && (
            <div className="col-span-full py-20 text-center">
              <p className="text-sm font-medium text-muted-foreground">
                Produk atau jasa tidak ditemukan.
              </p>
            </div>
          )}

          {!isLoading &&
            products.map((product) => {
              const qty = cartQuantityFor(product.id)
              const outOfStock = product.type === "PART" && product.stock <= 0
              const atStockLimit =
                product.type === "PART" && qty >= product.stock
              const isActive = qty > 0
              const isPart = product.type === "PART"

              return (
                <Card
                  key={product.id}
                  className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border p-4 transition-all duration-200 ${
                    isActive
                      ? "border-primary bg-primary/4 shadow-xs ring-1 ring-primary/20"
                      : "hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-xs"
                  } ${outOfStock ? "opacity-55" : ""}`}
                >
                  {/* Header Card: Nama & Category */}
                  <div className="space-y-1">
                    <div className="flex items-start justify-between gap-1.5">
                      <span
                        className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[9px] font-bold tracking-wider uppercase ${
                          isPart
                            ? "bg-violet-500/10 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400"
                            : "bg-sky-500/10 text-sky-600 dark:bg-sky-500/20 dark:text-sky-400"
                        }`}
                      >
                        {isPart ? (
                          <Package className="h-2.5 w-2.5" />
                        ) : (
                          <Wrench className="h-2.5 w-2.5" />
                        )}
                        {isPart ? "Part" : "Jasa"}
                      </span>

                      {/* Stock status badge for PARTS */}
                      {isPart && (
                        <span
                          className={`text-[10px] font-semibold ${
                            outOfStock
                              ? "text-destructive"
                              : product.stock <= product.minStock
                                ? "font-bold text-amber-500"
                                : "text-muted-foreground"
                          }`}
                        >
                          {outOfStock ? "Habis" : `Stok: ${product.stock}`}
                        </span>
                      )}
                    </div>

                    <p className="line-clamp-2 pt-1 text-sm leading-tight font-semibold tracking-tight transition-colors duration-150 group-hover:text-primary">
                      {product.name}
                    </p>
                    {product.category && (
                      <p className="text-[11px] font-medium text-muted-foreground">
                        {product.category.name}
                      </p>
                    )}
                  </div>

                  {/* Footer Card: Price & CTA Button */}
                  <div className="mt-4 space-y-3">
                    <div className="flex items-baseline justify-between gap-1">
                      <span className="font-mono text-sm font-bold text-primary">
                        {formatRupiah(product.sellPrice)}
                      </span>
                    </div>

                    {!isActive ? (
                      <Button
                        size="sm"
                        variant={outOfStock ? "outline" : "secondary"}
                        className="h-8 w-full cursor-pointer rounded-lg font-semibold transition-all active:scale-95"
                        disabled={outOfStock}
                        onClick={() => handleAddToCart(product.id)}
                      >
                        <Plus className="mr-1 h-3.5 w-3.5" />
                        Tambah
                      </Button>
                    ) : (
                      <div className="flex h-8 items-center justify-between gap-1 rounded-lg border bg-muted/30 p-0.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 cursor-pointer rounded-md"
                          onClick={() => updateQuantity(product.id, qty - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="flex-1 text-center font-mono text-xs font-bold tabular-nums">
                          {qty}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 cursor-pointer rounded-md"
                          disabled={atStockLimit}
                          onClick={() => handleAddToCart(product.id)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              )
            })}
        </div>
      </ScrollArea>
    </div>
  )
}
