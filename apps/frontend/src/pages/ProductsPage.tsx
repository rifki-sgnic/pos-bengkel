import type { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, Ban, MoreHorizontal, Pencil, Plus } from "lucide-react"
import { useMemo, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import DeactivateConfirmDialog from "@/components/products/DeactivateConfirmDialog"
import { ProductFormDialog } from "@/components/products/ProductFormDialog"
import { DataTable } from "@/components/shared/DataTable"
import { useAuthStore } from "@/features/auth/useAuthStore"
import { useCategories } from "@/features/categories/useCategoriesQuery"
import {
  useDeactivateProduct,
  useProducts,
} from "@/features/products/useProductsQuery"
import { useDataTableUrlState } from "@/hooks/use-data-table-url-state"
import { formatRupiah } from "@/lib/formatters"
import type { Product, ProductType } from "@/types/product.types"

export function ProductsPage() {
  const user = useAuthStore((state) => state.user)
  const isOwner = user?.role === "OWNER"
  const { data: categories = [] } = useCategories()

  const { queryParams, getFilter, setFilter, tableProps } =
    useDataTableUrlState({
      defaultSortBy: "name",
      defaultPageSize: 10,
    })

  const typeFilter = getFilter("type")
  const categoryFilter = getFilter("categoryId")

  const { data: response, isLoading } = useProducts({
    ...queryParams,
    type: typeFilter as ProductType | undefined,
    categoryId: categoryFilter,
  })
  const products = response?.data ?? []
  const meta = response?.meta

  const deactivateProduct = useDeactivateProduct()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [deactivateId, setDeactivateId] = useState<string | null>(null)

  const handleAdd = () => {
    setEditingProduct(null)
    setDialogOpen(true)
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setDialogOpen(true)
  }

  const handleDeactivate = (id: string) => {
    setDeactivateId(id)
  }

  const handleDeactivateConfirm = () => {
    if (deactivateId) {
      deactivateProduct.mutate(deactivateId, {
        onSuccess: () => {
          setDeactivateId(null)
        },
      })
    }
  }

  // Helper buat bikin header sortable — cuma dipake di kolom yang backend-nya support sort
  function sortableHeader(label: string, align: "left" | "right" = "left") {
    return ({ column }: any) => (
      <div className={align === "right" ? "flex w-full justify-end" : ""}>
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className={`h-8 ${align === "right" ? "-mr-3 justify-end text-right" : "-ml-3 justify-start text-left"} hover:bg-muted`}
        >
          {label}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    )
  }

  const columns: ColumnDef<Product>[] = useMemo(() => {
    const cols: ColumnDef<Product>[] = [
      {
        accessorKey: "name",
        header: sortableHeader("Nama"),
        cell: ({ row }) => (
          <span className="font-medium">{row.original.name}</span>
        ),
        enableSorting: true,
      },
      {
        accessorKey: "type",
        header: "Tipe",
        enableSorting: false, // backend gak expose sort by type
        cell: ({ getValue }) => {
          const val = getValue() as string
          return (
            <Badge variant={val === "PART" ? "default" : "secondary"}>
              {val === "PART" ? "Part" : "Jasa"}
            </Badge>
          )
        },
      },
      {
        id: "category",
        header: "Kategori",
        enableSorting: false, // backend gak expose sort by relasi category
        cell: ({ row }) => row.original.category?.name ?? "-",
      },
    ]

    if (isOwner) {
      cols.push({
        accessorKey: "costPrice",
        header: sortableHeader("Harga Modal", "right"),
        cell: ({ getValue }) => (
          <div className="text-right font-mono">
            {formatRupiah(Number(getValue()) || 0)}
          </div>
        ),
      })
    }

    cols.push(
      {
        accessorKey: "sellPrice",
        header: sortableHeader("Harga Jual", "right"),
        cell: ({ getValue }) => (
          <div className="text-right font-mono">
            {formatRupiah(Number(getValue()) || 0)}
          </div>
        ),
      },
      {
        accessorKey: "stock",
        header: sortableHeader("Stok", "right"),
        cell: ({ row }) => {
          const p = row.original
          const isLowStock = p.type === "PART" && p.stock <= p.minStock
          return (
            <div className="text-right font-mono">
              {p.type === "JASA" ? (
                "-"
              ) : (
                <span
                  className={isLowStock ? "font-medium text-destructive" : ""}
                >
                  {p.stock}
                  {isLowStock && " ⚠"}
                </span>
              )}
            </div>
          )
        },
      }
    )

    if (isOwner) {
      cols.push({
        id: "actions",
        cell: ({ row }) => (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                }
              />
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleEdit(row.original)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleDeactivate(row.original.id)}
                  variant="destructive"
                >
                  <Ban className="mr-2 h-4 w-4" />
                  Nonaktifkan
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
      })
    }

    return cols
  }, [isOwner])

  const tableFilters = [
    {
      columnId: "type",
      label: "Tipe",
      options: [
        { label: "Part", value: "PART" },
        { label: "Jasa", value: "JASA" },
      ],
    },
    {
      columnId: "categoryId",
      label: "Kategori",
      options: categories.map((cat) => ({ label: cat.name, value: cat.id })),
    },
  ]

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

      <DataTable
        columns={columns}
        data={products}
        isLoading={isLoading}
        emptyMessage="Belum ada produk. Tambahkan produk pertama Anda."
        searchPlaceholder="Cari nama atau SKU produk..."
        filters={tableFilters}
        filterValues={{ type: typeFilter, categoryId: categoryFilter }}
        onFilterChange={setFilter}
        pageCount={meta?.totalPages ?? 0}
        totalItems={meta?.total ?? 0}
        {...tableProps}
      />

      <ProductFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        product={editingProduct}
      />

      <DeactivateConfirmDialog
        deactivateId={deactivateId}
        setDeactivateId={setDeactivateId}
        deactivateProduct={deactivateProduct}
        handleDeactivateConfirm={handleDeactivateConfirm}
      />
    </div>
  )
}
