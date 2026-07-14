import { Ban, MoreHorizontal, Pencil, Plus } from "lucide-react"
import { useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { ProductFormDialog } from "@/components/products/ProductFormDialog"
import { useAuthStore } from "@/features/auth/useAuthStore"
import {
  useDeactivateProduct,
  useProducts,
} from "@/features/products/useProductsQuery"
import type { Product } from "@/types/product.types"

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value)
}

export function ProductsPage() {
  const { data: products, isLoading } = useProducts()
  const deactivateProduct = useDeactivateProduct()
  const user = useAuthStore((state) => state.user)
  const isOwner = user?.role === "OWNER"

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  const handleAdd = () => {
    setEditingProduct(null)
    setDialogOpen(true)
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setDialogOpen(true)
  }

  const handleDeactivate = (id: string) => {
    if (
      confirm(
        "Nonaktifkan produk ini? Produk tidak akan muncul di daftar transaksi."
      )
    ) {
      deactivateProduct.mutate(id)
    }
  }

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Produk & Jasa
          </h1>
          <p className="text-sm text-muted-foreground">
            Kelola daftar produk dan jasa bengkel.
          </p>
        </div>
        {isOwner && (
          <Button onClick={handleAdd}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Produk
          </Button>
        )}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Tipe</TableHead>
              <TableHead>Kategori</TableHead>
              {isOwner && (
                <TableHead className="text-right">Harga Modal</TableHead>
              )}
              <TableHead className="text-right">Harga Jual</TableHead>
              <TableHead className="text-right">Stok</TableHead>
              {isOwner && <TableHead className="w-10" />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-8 text-center text-muted-foreground"
                >
                  Memuat data...
                </TableCell>
              </TableRow>
            )}

            {!isLoading && products?.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-8 text-center text-muted-foreground"
                >
                  Belum ada produk. Tambahkan produk pertama Anda.
                </TableCell>
              </TableRow>
            )}

            {products?.map((product) => {
              const isLowStock =
                product.type === "PART" && product.stock <= product.minStock

              return (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        product.type === "PART" ? "default" : "secondary"
                      }
                    >
                      {product.type === "PART" ? "Part" : "Jasa"}
                    </Badge>
                  </TableCell>
                  <TableCell>{product.category?.name ?? "-"}</TableCell>
                  {isOwner && (
                    <TableCell className="text-right">
                      {formatRupiah(product.costPrice ?? 0)}
                    </TableCell>
                  )}
                  <TableCell className="text-right">
                    {formatRupiah(product.sellPrice)}
                  </TableCell>
                  <TableCell className="text-right">
                    {product.type === "JASA" ? (
                      "-"
                    ) : (
                      <span
                        className={
                          isLowStock ? "font-medium text-destructive" : ""
                        }
                      >
                        {product.stock}
                        {isLowStock && " ⚠"}
                      </span>
                    )}
                  </TableCell>
                  {isOwner && (
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            />
                          }
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(product)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeactivate(product.id)}
                            className="text-destructive"
                          >
                            <Ban className="mr-2 h-4 w-4" />
                            Nonaktifkan
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <ProductFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        product={editingProduct}
      />
    </div>
  )
}
