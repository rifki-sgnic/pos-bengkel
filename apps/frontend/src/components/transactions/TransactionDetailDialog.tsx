import { useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"

import { useAuthStore } from "@/features/auth/useAuthStore"
import { useVoidTransaction } from "@/features/transactions/useTransactionsQuery"
import { formatDate, formatRupiah } from "@/lib/formatters"
import type { Transaction } from "@/types/transaction.types"

interface TransactionDetailDialogProps {
  transaction: Transaction | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TransactionDetailDialog({
  transaction,
  open,
  onOpenChange,
}: TransactionDetailDialogProps) {
  const [voidReason, setVoidReason] = useState("")
  const [showVoidForm, setShowVoidForm] = useState(false)
  const voidTransaction = useVoidTransaction()
  const user = useAuthStore((state) => state.user)
  const isOwner = user?.role === "OWNER"

  if (!transaction) return null

  const handleVoid = () => {
    if (voidReason.trim().length < 5) return

    voidTransaction.mutate(
      { id: transaction.id, voidReason },
      {
        onSuccess: () => {
          setShowVoidForm(false)
          setVoidReason("")
          onOpenChange(false)
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {transaction.invoiceNumber}
            <Badge
              variant={
                transaction.status === "VOIDED" ? "destructive" : "default"
              }
            >
              {transaction.status === "VOIDED" ? "Void" : "Selesai"}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1 text-sm text-muted-foreground">
            <p>{formatDate(transaction.createdAt)}</p>
            <p>Kasir: {transaction.cashier.name}</p>
            {transaction.customerName && (
              <p>Pelanggan: {transaction.customerName}</p>
            )}
          </div>

          <Separator />

          <div className="space-y-2">
            {transaction.items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <div>
                  <p className="font-medium">{item.product.name}</p>
                  <p className="text-muted-foreground">
                    {item.quantity} x {formatRupiah(item.priceAtSale)}
                  </p>
                </div>
                <p className="font-medium">{formatRupiah(item.subtotal)}</p>
              </div>
            ))}
          </div>

          <Separator />

          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatRupiah(transaction.subtotal)}</span>
            </div>
            {transaction.discount > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Diskon</span>
                <span>-{formatRupiah(transaction.discount)}</span>
              </div>
            )}
            {transaction.tax > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pajak</span>
                <span>{formatRupiah(transaction.tax)}</span>
              </div>
            )}
            <div className="flex justify-between pt-1 text-base font-semibold">
              <span>Total</span>
              <span>{formatRupiah(transaction.total)}</span>
            </div>
          </div>

          {transaction.status === "VOIDED" && transaction.voidReason && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              <p className="font-medium">Alasan void:</p>
              <p>{transaction.voidReason}</p>
            </div>
          )}

          {isOwner && transaction.status === "COMPLETED" && (
            <>
              {!showVoidForm ? (
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() => setShowVoidForm(true)}
                >
                  Void Transaksi
                </Button>
              ) : (
                <div className="space-y-2">
                  <Textarea
                    placeholder="Alasan void (minimal 5 karakter)..."
                    value={voidReason}
                    onChange={(e) => setVoidReason(e.target.value)}
                  />
                  <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                      variant="outline"
                      onClick={() => setShowVoidForm(false)}
                    >
                      Batal
                    </Button>
                    <Button
                      variant="destructive"
                      disabled={
                        voidReason.trim().length < 5 ||
                        voidTransaction.isPending
                      }
                      onClick={handleVoid}
                    >
                      {voidTransaction.isPending
                        ? "Memproses..."
                        : "Konfirmasi Void"}
                    </Button>
                  </DialogFooter>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
