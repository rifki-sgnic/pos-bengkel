import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { formatRupiah } from "@/lib/formatters"

interface CheckoutConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  items: { product: { name: string; sellPrice: number }; quantity: number }[]
  subtotal: number
  discount: number
  tax: number
  total: number
  paymentMethod: string
  cashTendered?: number
  change?: number
  customerName?: string
  onConfirm: () => void
  isSubmitting: boolean
}

export function CheckoutConfirmDialog({
  open,
  onOpenChange,
  items,
  subtotal,
  discount,
  tax,
  total,
  paymentMethod,
  cashTendered,
  change,
  customerName,
  onConfirm,
  isSubmitting,
}: CheckoutConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Konfirmasi Transaksi</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 text-sm">
          {customerName && (
            <p className="text-muted-foreground">Pelanggan: {customerName}</p>
          )}

          <div className="max-h-40 space-y-1.5 overflow-y-auto">
            {items.map((line, idx) => (
              <div key={idx} className="flex justify-between">
                <span className="text-muted-foreground">
                  {line.quantity}× {line.product.name}
                </span>
                <span className="font-mono">
                  {formatRupiah(line.quantity * line.product.sellPrice)}
                </span>
              </div>
            ))}
          </div>

          <Separator />

          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-mono">{formatRupiah(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Diskon</span>
                <span className="font-mono">-{formatRupiah(discount)}</span>
              </div>
            )}
            {tax > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pajak</span>
                <span className="font-mono">{formatRupiah(tax)}</span>
              </div>
            )}
            <div className="flex justify-between pt-1 text-base font-semibold">
              <span>Total</span>
              <span className="font-mono">{formatRupiah(total)}</span>
            </div>
          </div>

          <Separator />

          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Metode Bayar</span>
              <span className="font-medium">{paymentMethod}</span>
            </div>
            {paymentMethod === "CASH" && cashTendered !== undefined && (
              <>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Uang Diterima</span>
                  <span className="font-mono">
                    {formatRupiah(cashTendered)}
                  </span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Kembalian</span>
                  <span className="font-mono">{formatRupiah(change ?? 0)}</span>
                </div>
              </>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Batal
          </Button>
          <Button onClick={onConfirm} disabled={isSubmitting}>
            {isSubmitting ? "Memproses..." : "Konfirmasi & Checkout"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
