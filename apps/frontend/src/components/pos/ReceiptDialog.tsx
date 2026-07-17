import { CheckCircle2, Printer } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { formatRupiah } from "@/lib/formatters"
import type { Transaction } from "@/types/transaction.types"

interface ReceiptDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  transaction: Transaction | null
  cashTendered?: number
  change?: number
}

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(dateStr))
}

export function ReceiptDialog({
  open,
  onOpenChange,
  transaction,
  cashTendered,
  change,
}: ReceiptDialogProps) {
  if (!transaction) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <div id="receipt-print-area" className="space-y-4">
          <div className="flex flex-col items-center gap-1 pb-2 text-center">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
            <p className="font-semibold">Transaksi Berhasil</p>
            <p className="text-xs text-muted-foreground">
              {transaction.invoiceNumber}
            </p>
          </div>

          <Separator className="border-dashed" />

          <div className="space-y-0.5 text-xs text-muted-foreground">
            <p>{formatDate(transaction.createdAt)}</p>
            {transaction.cashier?.name && (
              <p>Kasir: {transaction.cashier.name}</p>
            )}
            {transaction.customerName && (
              <p>Pelanggan: {transaction.customerName}</p>
            )}
          </div>

          <Separator className="border-dashed" />

          <div className="space-y-1 text-sm">
            {transaction.items.map((item) => (
              <div key={item.id} className="flex justify-between">
                <span>
                  {item.quantity}× {item.product.name}
                </span>
                <span className="font-mono">{formatRupiah(item.subtotal)}</span>
              </div>
            ))}
          </div>

          <Separator className="border-dashed" />

          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-mono">
                {formatRupiah(transaction.subtotal)}
              </span>
            </div>
            {transaction.discount > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Diskon</span>
                <span className="font-mono">
                  -{formatRupiah(transaction.discount)}
                </span>
              </div>
            )}
            {transaction.tax > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pajak</span>
                <span className="font-mono">
                  {formatRupiah(transaction.tax)}
                </span>
              </div>
            )}
            <div className="flex justify-between pt-1 text-base font-semibold">
              <span>Total</span>
              <span className="font-mono">
                {formatRupiah(transaction.total)}
              </span>
            </div>
            {transaction.paymentMethod === "CASH" &&
              cashTendered !== undefined && (
                <>
                  <div className="flex justify-between pt-1">
                    <span className="text-muted-foreground">Tunai</span>
                    <span className="font-mono">
                      {formatRupiah(cashTendered)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Kembalian</span>
                    <span className="font-mono">
                      {formatRupiah(change ?? 0)}
                    </span>
                  </div>
                </>
              )}
          </div>

          <Separator className="border-dashed" />
          <p className="text-center text-xs text-muted-foreground">
            Terima kasih!
          </p>
        </div>

        <div className="flex gap-2 pt-2 print:hidden">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            Tutup
          </Button>
          <Button className="flex-1" onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
