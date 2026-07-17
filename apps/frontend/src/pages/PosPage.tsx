import { useState, useMemo } from "react"
import {
  Search,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  Banknote,
  Landmark,
  QrCode,
} from "lucide-react"
import { toast } from "sonner"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

import { useProducts } from "@/features/products/useProductsQuery"
import { useCategories } from "@/features/categories/useCategoriesQuery"
import { useCartStore } from "@/features/transactions/useCartStore"
import { useCreateTransaction } from "@/features/transactions/useTransactionsQuery"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { formatRupiah } from "@/lib/formatters"
import { CheckoutConfirmDialog } from "@/components/pos/CheckoutConfirmDialog"
import { ReceiptDialog } from "@/components/pos/ReceiptDialog"
import type { PaymentMethod } from "@/types/transaction.types"
import type { ProductType } from "@/types/product.types"
import type { Transaction } from "@/types/transaction.types"

type TypeTab = "ALL" | ProductType

const paymentOptions: {
  value: PaymentMethod
  label: string
  icon: typeof Banknote
}[] = [
  { value: "CASH", label: "Cash", icon: Banknote },
  { value: "TRANSFER", label: "Transfer", icon: Landmark },
  { value: "QRIS", label: "QRIS", icon: QrCode },
]

export function PosPage() {
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebouncedValue(search, 300)
  const [typeTab, setTypeTab] = useState<TypeTab>("ALL")
  const [categoryId, setCategoryId] = useState<string | undefined>()

  const { data: categories } = useCategories()
  const { data: response, isLoading } = useProducts({
    search: debouncedSearch || undefined,
    type: typeTab === "ALL" ? undefined : typeTab,
    categoryId,
    limit: 50,
    sortBy: "name",
    sortOrder: "asc",
  })
  const products = response?.data ?? []

  const { items, addItem, updateQuantity, clear } = useCartStore()
  const createTransaction = useCreateTransaction()

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH")
  const [customerName, setCustomerName] = useState("")
  const [discountInput, setDiscountInput] = useState("")
  const [taxInput, setTaxInput] = useState("")
  const [cashTenderedInput, setCashTenderedInput] = useState("")

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [receiptOpen, setReceiptOpen] = useState(false)
  const [completedTransaction, setCompletedTransaction] =
    useState<Transaction | null>(null)
  const [receiptCashInfo, setReceiptCashInfo] = useState<{
    cashTendered: number
    change: number
  } | null>(null)

  const subtotal = useMemo(
    () =>
      items.reduce(
        (sum, line) => sum + line.product.sellPrice * line.quantity,
        0
      ),
    [items]
  )
  const discount = Number(discountInput) || 0
  const tax = Number(taxInput) || 0
  const total = Math.max(0, subtotal - discount + tax)
  const cashTendered = Number(cashTenderedInput) || 0
  const change = cashTendered - total

  const cartQuantityFor = (productId: string) =>
    items.find((line) => line.product.id === productId)?.quantity ?? 0

  const handleAddToCart = (productId: string) => {
    const product = products.find((p) => p.id === productId)
    if (!product) return

    if (product.type === "PART" && product.stock <= 0) {
      toast.error("Stok produk ini habis")
      return
    }
    if (
      product.type === "PART" &&
      cartQuantityFor(productId) >= product.stock
    ) {
      toast.error("Stok tidak mencukupi")
      return
    }

    addItem(product)
  }

  const handleClearCart = () => {
    if (items.length === 0) return
    if (confirm("Kosongkan semua item di keranjang?")) {
      clear()
      setDiscountInput("")
      setTaxInput("")
      setCashTenderedInput("")
    }
  }

  const handleOpenConfirm = () => {
    if (items.length === 0) {
      toast.error("Keranjang masih kosong")
      return
    }
    if (paymentMethod === "CASH" && cashTendered < total) {
      toast.error("Uang yang diterima kurang dari total")
      return
    }
    setConfirmOpen(true)
  }

  const handleConfirmCheckout = () => {
    createTransaction.mutate(
      {
        customerName: customerName || undefined,
        items: items.map((line) => ({
          productId: line.product.id,
          quantity: line.quantity,
        })),
        discount,
        tax,
        paymentMethod,
      },
      {
        onSuccess: (transaction) => {
          setConfirmOpen(false)
          setCompletedTransaction(transaction)
          if (paymentMethod === "CASH") {
            setReceiptCashInfo({ cashTendered, change: Math.max(0, change) })
          } else {
            setReceiptCashInfo(null)
          }
          setReceiptOpen(true)
          clear()
          setCustomerName("")
          setDiscountInput("")
          setTaxInput("")
          setCashTenderedInput("")
        },
      }
    )
  }

  return (
    <div className="grid h-full grid-cols-1 lg:grid-cols-[1fr_400px]">
      {/* Panel kiri: sama persis kayak sebelumnya, gak ada perubahan */}
      <div className="flex min-h-0 flex-col gap-4 p-6">
        <div className="relative">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari produk atau jasa..."
            className="h-11 pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="inline-flex w-fit gap-1 rounded-lg bg-muted p-1">
          {(["ALL", "PART", "JASA"] as TypeTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setTypeTab(tab)}
              className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                typeTab === tab
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab === "ALL" ? "Semua" : tab === "PART" ? "Part" : "Jasa"}
            </button>
          ))}
        </div>

        {categories && categories.length > 0 && (
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
            <button
              onClick={() => setCategoryId(undefined)}
              className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                !categoryId
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:border-foreground/30"
              }`}
            >
              Semua Kategori
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategoryId(cat.id)}
                className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  categoryId === cat.id
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground hover:border-foreground/30"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        <ScrollArea className="min-h-0 flex-1">
          <div className="grid grid-cols-2 gap-3 pr-3 pb-2 md:grid-cols-3 xl:grid-cols-4">
            {isLoading &&
              Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="h-28 animate-pulse rounded-lg bg-muted"
                />
              ))}

            {!isLoading && products.length === 0 && (
              <p className="col-span-full py-12 text-center text-sm text-muted-foreground">
                Produk tidak ditemukan.
              </p>
            )}

            {!isLoading &&
              products.map((product) => {
                const qty = cartQuantityFor(product.id)
                const outOfStock = product.type === "PART" && product.stock <= 0
                const atStockLimit =
                  product.type === "PART" && qty >= product.stock
                const isActive = qty > 0

                return (
                  <Card
                    key={product.id}
                    className={`relative flex flex-col gap-2 p-3 transition-all ${
                      isActive
                        ? "border-primary bg-primary/3 ring-1 ring-primary/30"
                        : "hover:border-foreground/20"
                    } ${outOfStock ? "opacity-50" : ""}`}
                  >
                    <div className="min-h-0 flex-1">
                      <p className="line-clamp-2 text-sm leading-snug font-medium">
                        {product.name}
                      </p>
                      {product.category && (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {product.category.name}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm font-semibold">
                        {formatRupiah(product.sellPrice)}
                      </span>
                      {product.type === "PART" && (
                        <span
                          className={`text-[11px] ${
                            product.stock <= product.minStock
                              ? "font-medium text-destructive"
                              : "text-muted-foreground"
                          }`}
                        >
                          Stok {product.stock}
                        </span>
                      )}
                    </div>

                    {!isActive ? (
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-8 w-full"
                        disabled={outOfStock}
                        onClick={() => handleAddToCart(product.id)}
                      >
                        <Plus className="mr-1 h-3.5 w-3.5" />
                        Tambah
                      </Button>
                    ) : (
                      <div className="flex h-8 items-center justify-between gap-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 shrink-0"
                          onClick={() => updateQuantity(product.id, qty - 1)}
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </Button>
                        <span className="flex-1 text-center text-sm font-semibold tabular-nums">
                          {qty}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 shrink-0"
                          disabled={atStockLimit}
                          onClick={() => handleAddToCart(product.id)}
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}
                  </Card>
                )
              })}
          </div>
        </ScrollArea>
      </div>

      {/* Panel kanan: cart — ada tambahan diskon/pajak/cash tendered + tombol clear */}
      <div className="flex min-h-0 flex-col border-l bg-muted/10">
        <div className="flex items-center gap-2 border-b p-4">
          <ShoppingCart className="h-4 w-4" />
          <h2 className="font-semibold">Keranjang</h2>
          {items.length > 0 && (
            <>
              <Badge
                key={items.length}
                variant="secondary"
                className="ml-auto animate-in duration-200 zoom-in"
              >
                {items.reduce((sum, l) => sum + l.quantity, 0)} item
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-muted-foreground hover:text-destructive"
                onClick={handleClearCart}
              >
                <Trash2 className="mr-1 h-3.5 w-3.5" />
                Kosongkan
              </Button>
            </>
          )}
        </div>

        <ScrollArea className="min-h-0 flex-1">
          <div className="p-4">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
                <ShoppingCart className="h-8 w-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">
                  Keranjang kosong. Pilih produk di sebelah kiri.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((line) => (
                  <div
                    key={line.product.id}
                    className="flex items-start gap-2 text-sm"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">
                        {line.product.name}
                      </p>
                      <p className="font-mono text-xs text-muted-foreground">
                        {line.quantity} × {formatRupiah(line.product.sellPrice)}
                      </p>
                    </div>
                    <span className="shrink-0 font-mono font-medium">
                      {formatRupiah(line.quantity * line.product.sellPrice)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 shrink-0 text-muted-foreground hover:text-destructive"
                      onClick={() => updateQuantity(line.product.id, 0)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="space-y-3 border-t border-dashed p-4">
          <Input
            placeholder="Nama pelanggan (opsional)"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              placeholder="Diskon (Rp)"
              value={discountInput}
              onChange={(e) => setDiscountInput(e.target.value)}
            />
            <Input
              type="number"
              placeholder="Pajak (Rp)"
              value={taxInput}
              onChange={(e) => setTaxInput(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            {paymentOptions.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setPaymentMethod(value)}
                className={`flex flex-col items-center gap-1 rounded-lg border py-2.5 text-xs font-medium transition-colors ${
                  paymentMethod === value
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border text-muted-foreground hover:border-foreground/30"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>

          {paymentMethod === "CASH" && (
            <div className="space-y-1.5">
              <Input
                type="number"
                placeholder="Uang diterima (Rp)"
                value={cashTenderedInput}
                onChange={(e) => setCashTenderedInput(e.target.value)}
              />
              {cashTenderedInput && (
                <div className="flex justify-between px-1 text-xs">
                  <span className="text-muted-foreground">Kembalian</span>
                  <span
                    className={`font-mono font-medium ${change < 0 ? "text-destructive" : ""}`}
                  >
                    {formatRupiah(Math.max(0, change))}
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="space-y-1 border-t border-dashed pt-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-mono">{formatRupiah(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Diskon</span>
                <span className="font-mono">-{formatRupiah(discount)}</span>
              </div>
            )}
            {tax > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Pajak</span>
                <span className="font-mono">{formatRupiah(tax)}</span>
              </div>
            )}
            <div className="flex items-center justify-between pt-1">
              <span className="text-sm font-medium">Total</span>
              <span className="font-mono text-xl font-semibold">
                {formatRupiah(total)}
              </span>
            </div>
          </div>

          <Button
            className="h-11 w-full"
            size="lg"
            disabled={items.length === 0 || createTransaction.isPending}
            onClick={handleOpenConfirm}
          >
            Checkout
          </Button>
        </div>
      </div>

      <CheckoutConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        items={items}
        subtotal={subtotal}
        discount={discount}
        tax={tax}
        total={total}
        paymentMethod={paymentMethod}
        cashTendered={paymentMethod === "CASH" ? cashTendered : undefined}
        change={paymentMethod === "CASH" ? Math.max(0, change) : undefined}
        customerName={customerName}
        onConfirm={handleConfirmCheckout}
        isSubmitting={createTransaction.isPending}
      />

      <ReceiptDialog
        open={receiptOpen}
        onOpenChange={setReceiptOpen}
        transaction={completedTransaction}
        cashTendered={receiptCashInfo?.cashTendered}
        change={receiptCashInfo?.change}
      />
    </div>
  )
}
