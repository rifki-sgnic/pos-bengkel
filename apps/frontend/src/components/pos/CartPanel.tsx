import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatRupiah } from "@/lib/formatters"
import type { Product } from "@/types/product.types"
import type { PaymentMethod } from "@/types/transaction.types"
import { Banknote, Landmark, QrCode, ShoppingCart, Trash2 } from "lucide-react"

interface CartLine {
  product: Product
  quantity: number
}

interface CartPanelProps {
  items: CartLine[]
  updateQuantity: (id: string, qty: number) => void
  handleClearCart: () => void
  customerName: string
  onCustomerNameChange: (val: string) => void
  discountInput: string
  onDiscountInputChange: (val: string) => void
  taxInput: string
  onTaxInputChange: (val: string) => void
  cashTenderedInput: string
  onCashTenderedInputChange: (val: string) => void
  paymentMethod: PaymentMethod
  onPaymentMethodChange: (val: PaymentMethod) => void
  subtotal: number
  discount: number
  tax: number
  total: number
  change: number
  handleOpenConfirm: () => void
  isPending: boolean
}

const paymentOptions: {
  value: PaymentMethod
  label: string
  icon: typeof Banknote
}[] = [
  { value: "CASH", label: "Cash", icon: Banknote },
  { value: "TRANSFER", label: "Transfer", icon: Landmark },
  { value: "QRIS", label: "QRIS", icon: QrCode },
]

export function CartPanel({
  items,
  updateQuantity,
  handleClearCart,
  customerName,
  onCustomerNameChange,
  discountInput,
  onDiscountInputChange,
  taxInput,
  onTaxInputChange,
  cashTenderedInput,
  onCashTenderedInputChange,
  paymentMethod,
  onPaymentMethodChange,
  subtotal,
  discount,
  tax,
  total,
  change,
  handleOpenConfirm,
  isPending,
}: CartPanelProps) {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden border-l shadow-lg">
      {/* Header Keranjang */}
      <div className="flex items-center gap-2 border-b bg-muted/10 p-5">
        <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <ShoppingCart className="h-4.5 w-4.5" />
        </div>
        <div>
          <h2 className="text-sm font-bold">Keranjang Belanja</h2>
          <p className="text-[10px] text-muted-foreground">
            Detail transaksi aktif
          </p>
        </div>
        {items.length > 0 && (
          <>
            <Badge
              key={items.length}
              variant="secondary"
              className="ml-auto animate-in rounded-full border-none bg-primary/10 text-xs font-semibold text-primary duration-200 zoom-in"
            >
              {items.reduce((sum, l) => sum + l.quantity, 0)} item
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 cursor-pointer rounded-lg px-2 text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              onClick={handleClearCart}
            >
              <Trash2 className="mr-1 h-3.5 w-3.5" />
              Reset
            </Button>
          </>
        )}
      </div>

      {/* Conditionally Render ScrollArea Only When Items Exist To Prevent Scrolling When Empty */}
      {items.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center select-none">
          <div className="rounded-full bg-muted p-4 text-muted-foreground/30">
            <ShoppingCart className="h-8 w-8" />
          </div>
          <p className="text-sm font-semibold text-muted-foreground">
            Keranjang kosong.
          </p>
          <p className="max-w-[200px] text-xs leading-relaxed text-muted-foreground">
            Pilih produk dari daftar katalog di sebelah kiri untuk ditambahkan.
          </p>
        </div>
      ) : (
        <ScrollArea className="min-h-0 flex-1">
          <div className="space-y-4 p-5">
            <div className="space-y-3">
              {items.map((line) => (
                <div
                  key={line.product.id}
                  className="group flex animate-in items-center justify-between gap-3 rounded-xl border bg-muted/20 p-3 transition-all duration-150 fade-in slide-in-from-top-1 hover:border-foreground/10 hover:bg-muted/30"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold tracking-tight text-foreground">
                      {line.product.name}
                    </p>
                    <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                      {line.quantity} × {formatRupiah(line.product.sellPrice)}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <span className="font-mono text-sm font-bold text-foreground">
                      {formatRupiah(line.quantity * line.product.sellPrice)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 cursor-pointer rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => updateQuantity(line.product.id, 0)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>
      )}

      {/* Bottom Cart Inputs & Checkout Actions */}
      <div className="space-y-4 border-t border-dashed bg-muted/10 p-5">
        <div className="space-y-3.5">
          <Input
            placeholder="Nama pelanggan (opsional)"
            value={customerName}
            onChange={(e) => onCustomerNameChange(e.target.value)}
            className="h-10 rounded-xl border text-sm font-medium shadow-none focus-visible:ring-1"
          />

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <span className="px-1 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                Diskon (Rp)
              </span>
              <Input
                type="number"
                placeholder="0"
                value={discountInput}
                onChange={(e) => onDiscountInputChange(e.target.value)}
                className="h-10 rounded-xl border text-sm font-medium shadow-none focus-visible:ring-1"
              />
            </div>
            <div className="space-y-1">
              <span className="px-1 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                Pajak (Rp)
              </span>
              <Input
                type="number"
                placeholder="0"
                value={taxInput}
                onChange={(e) => onTaxInputChange(e.target.value)}
                className="h-10 rounded-xl border text-sm font-medium shadow-none focus-visible:ring-1"
              />
            </div>
          </div>

          {/* Payment Method Selector Grid */}
          <div className="space-y-1">
            <span className="px-1 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
              Metode Pembayaran
            </span>
            <div className="grid grid-cols-3 gap-2">
              {paymentOptions.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => onPaymentMethodChange(value)}
                  className={`flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border py-2.5 text-xs font-semibold transition-all duration-200 ${
                    paymentMethod === value
                      ? "border-primary bg-primary/5 text-primary shadow-xs ring-1 ring-primary/10"
                      : "border-border text-muted-foreground hover:border-foreground/30"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {paymentMethod === "CASH" && (
            <div className="space-y-1">
              <span className="px-1 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                Uang Diterima
              </span>
              <Input
                type="number"
                placeholder="Contoh: 100000"
                value={cashTenderedInput}
                onChange={(e) => onCashTenderedInputChange(e.target.value)}
                className="h-10 rounded-xl border text-sm font-semibold shadow-none focus-visible:ring-1"
              />
              {cashTenderedInput && (
                <div className="flex animate-in justify-between px-1 pt-1.5 text-xs duration-200 fade-in">
                  <span className="text-muted-foreground">Kembalian</span>
                  <span
                    className={`font-mono text-sm font-bold ${change < 0 ? "text-destructive" : "text-emerald-500"}`}
                  >
                    {formatRupiah(Math.max(0, change))}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Pricing Summary */}
        <div className="space-y-1.5 border-t border-dashed pt-3">
          <div className="flex items-center justify-between text-xs font-medium">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-mono text-muted-foreground">
              {formatRupiah(subtotal)}
            </span>
          </div>
          {discount > 0 && (
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-muted-foreground">Diskon</span>
              <span className="font-mono text-destructive">
                -{formatRupiah(discount)}
              </span>
            </div>
          )}
          {tax > 0 && (
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-muted-foreground">Pajak</span>
              <span className="font-mono text-muted-foreground">
                +{formatRupiah(tax)}
              </span>
            </div>
          )}
          <div className="mt-1.5 flex items-center justify-between border-t border-dashed pt-2.5">
            <span className="text-sm font-bold text-foreground">
              Total Bayar
            </span>
            <span className="bg-linear-to-r from-primary to-primary bg-clip-text font-mono text-2xl font-black text-primary">
              {formatRupiah(total)}
            </span>
          </div>
        </div>

        <Button
          className="h-12 w-full cursor-pointer rounded-xl text-base font-bold shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl active:scale-95"
          size="lg"
          disabled={items.length === 0 || isPending}
          onClick={handleOpenConfirm}
        >
          Checkout Transaksi
        </Button>
      </div>
    </div>
  )
}
