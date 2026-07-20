import { useState, useMemo } from "react"
import { toast } from "sonner"

import { useProducts } from "@/features/products/useProductsQuery"
import { useCategories } from "@/features/categories/useCategoriesQuery"
import { useCartStore } from "@/features/transactions/useCartStore"
import { useCreateTransaction } from "@/features/transactions/useTransactionsQuery"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { CheckoutConfirmDialog } from "@/components/pos/CheckoutConfirmDialog"
import { ReceiptDialog } from "@/components/pos/ReceiptDialog"
import ClearCartConfirmDialog from "@/components/pos/ClearCartConfirmDialog"
import { ProductCatalog } from "@/components/pos/ProductCatalog"
import { CartPanel } from "@/components/pos/CartPanel"

import type { PaymentMethod } from "@/types/transaction.types"
import type { ProductType } from "@/types/product.types"
import type { Transaction } from "@/types/transaction.types"

type TypeTab = "ALL" | ProductType

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
  const [clearCartOpen, setClearCartOpen] = useState(false)
  const [receiptOpen, setReceiptOpen] = useState(false)
  const [completedTransaction, setCompletedTransaction] =
    useState<Transaction | null>(null)
  const [receiptCashInfo, setReceiptCashInfo] = useState<{
    cashTendered: number
    change: number
  } | null>(null)

  const subtotal = useMemo(
    () =>
      items.reduce((sum, line) => sum + line.quantity * line.product.sellPrice, 0),
    [items]
  )

  const discount = Number(discountInput) || 0
  const tax = Number(taxInput) || 0
  const total = useMemo(
    () => Math.max(0, subtotal - discount + tax),
    [subtotal, discount, tax]
  )

  const cashTendered = Number(cashTenderedInput) || 0
  const change = useMemo(() => cashTendered - total, [cashTendered, total])

  const cartQuantityFor = (productId: string) => {
    const item = items.find((line) => line.product.id === productId)
    return item ? item.quantity : 0
  }

  const handleAddToCart = (productId: string) => {
    const product = products.find((p) => p.id === productId)
    if (!product) return

    const currentQty = cartQuantityFor(productId)
    if (product.type === "PART" && currentQty >= product.stock) {
      toast.error("Stok produk tidak mencukupi")
      return
    }

    addItem(product)
  }

  const handleClearCart = () => {
    if (items.length === 0) return
    setClearCartOpen(true)
  }

  const handleClearCartConfirm = () => {
    clear()
    setDiscountInput("")
    setTaxInput("")
    setCashTenderedInput("")
    setClearCartOpen(false)
  }

  const handleOpenConfirm = () => {
    if (items.length === 0) {
      toast.error("Keranjang masih kosong")
      return
    }
    if (paymentMethod === "CASH" && cashTendered < total) {
      toast.error("Uang diterima kurang dari total pembayaran")
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
    <div className="grid h-[calc(100vh-57px)] w-full grid-cols-1 lg:grid-cols-[1fr_420px] bg-background overflow-hidden">
      {/* Product Catalog Column */}
      <ProductCatalog
        search={search}
        onSearchChange={setSearch}
        typeTab={typeTab}
        onTypeTabChange={setTypeTab}
        categoryId={categoryId}
        onCategoryIdChange={setCategoryId}
        categories={categories}
        products={products}
        isLoading={isLoading}
        cartQuantityFor={cartQuantityFor}
        handleAddToCart={handleAddToCart}
        updateQuantity={updateQuantity}
      />

      {/* Cart Column */}
      <CartPanel
        items={items}
        updateQuantity={updateQuantity}
        handleClearCart={handleClearCart}
        customerName={customerName}
        onCustomerNameChange={setCustomerName}
        discountInput={discountInput}
        onDiscountInputChange={setDiscountInput}
        taxInput={taxInput}
        onTaxInputChange={setTaxInput}
        cashTenderedInput={cashTenderedInput}
        onCashTenderedInputChange={setCashTenderedInput}
        paymentMethod={paymentMethod}
        onPaymentMethodChange={setPaymentMethod}
        subtotal={subtotal}
        discount={discount}
        tax={tax}
        total={total}
        change={change}
        handleOpenConfirm={handleOpenConfirm}
        isPending={createTransaction.isPending}
      />

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

      <ClearCartConfirmDialog
        open={clearCartOpen}
        onOpenChange={setClearCartOpen}
        onConfirm={handleClearCartConfirm}
      />
    </div>
  )
}
