import { useCategories } from "@/features/categories/useCategoriesQuery"
import {
  useCreateProduct,
  useUpdateProduct,
} from "@/features/products/useProductsQuery"
import type { Product } from "@/types/product.types"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect } from "react"
import { Controller, useForm } from "react-hook-form"
import z from "zod"
import { Button } from "../ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"

const productSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  sku: z.string().optional(),
  type: z.enum(["PART", "JASA"]),
  costPrice: z.coerce.number().nonnegative("Harga tidak boleh negatif"),
  sellPrice: z.coerce.number().positive("Harga harus lebih dari 0"),
  stock: z.coerce
    .number()
    .int()
    .nonnegative("Stock tidak boleh negatif")
    .optional(),
  minStock: z.coerce
    .number()
    .int()
    .nonnegative("Stock minimal tidak boleh negatif")
    .optional(),
  categoryId: z.string().optional(),
})

type ProductFormInput = z.input<typeof productSchema>
type ProductFormOutput = z.output<typeof productSchema>

interface ProductFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product?: Product | null
}

export function ProductFormDialog({
  open,
  onOpenChange,
  product,
}: ProductFormDialogProps) {
  const isEditMode = Boolean(product)
  const { data: categories } = useCategories()
  const createProduct = useCreateProduct()
  const updateProduct = useUpdateProduct()

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<ProductFormInput, any, ProductFormOutput>({
    resolver: zodResolver(productSchema),
    defaultValues: { type: "PART" },
  })

  const selectedType = watch("type")

  useEffect(() => {
    if (open) {
      if (product) {
        reset({
          name: product.name,
          sku: product.sku ?? "",
          type: product.type,
          costPrice: product.costPrice ?? 0,
          sellPrice: product.sellPrice,
          stock: product.stock,
          minStock: product.minStock,
          categoryId: product.categoryId ?? undefined,
        })
      } else {
        reset({
          name: "",
          sku: "",
          type: "PART",
          costPrice: 0,
          sellPrice: 0,
          stock: 0,
          minStock: 5,
        })
      }
    }
  }, [open, product, reset])

  const onSubmit = (data: ProductFormOutput) => {
    const payload = { ...data, stock: data.type === "JASA" ? 0 : data.stock }

    if (isEditMode && product) {
      updateProduct.mutate(
        { id: product.id, payload },
        { onSuccess: () => onOpenChange(false) }
      )
    } else {
      createProduct.mutate(payload, { onSuccess: () => onOpenChange(false) })
    }
  }

  const isPending = createProduct.isPending || updateProduct.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Produk" : "Tambah Produk"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Produk/Jasa</Label>
            <Input id="name" {...register("name")} />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipe</Label>
              <Controller
                control={control}
                name="type"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PART">Part (barang)</SelectItem>
                      <SelectItem value="JASA">Jasa</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sku">SKU (opsional)</Label>
              <Input id="sku" {...register("sku")} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Kategori</Label>
            <Controller
              control={control}
              name="categoryId"
              render={({ field }) => {
                const selectedCategory = categories?.find(
                  (cat) => cat.id === field.value
                )

                return (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={!categories}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          categories
                            ? "Pilih kategori (opsional)"
                            : "Memuat kategori..."
                        }
                      >
                        {selectedCategory?.name}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )
              }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="costPrice">Harga Modal</Label>
              <Input id="costPrice" type="number" {...register("costPrice")} />
              {errors.costPrice && (
                <p className="text-sm text-destructive">
                  {errors.costPrice.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="sellPrice">Harga Jual</Label>
              <Input id="sellPrice" type="number" {...register("sellPrice")} />
              {errors.sellPrice && (
                <p className="text-sm text-destructive">
                  {errors.sellPrice.message}
                </p>
              )}
            </div>
          </div>

          {/* Stok cuma relevan buat tipe PART, disembunyiin kalau JASA */}
          {selectedType === "PART" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stock">Stok Awal</Label>
                <Input id="stock" type="number" {...register("stock")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="minStock">Stok Minimum</Label>
                <Input id="minStock" type="number" {...register("minStock")} />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
