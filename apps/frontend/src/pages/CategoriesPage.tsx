import type { ColumnDef } from "@tanstack/react-table"
import { FolderPlus, Trash2 } from "lucide-react"
import { useMemo, useState } from "react"

import { DataTable } from "@/components/shared/DataTable"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuthStore } from "@/features/auth/useAuthStore"
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
} from "@/features/categories/useCategoriesQuery"
import type { Category } from "@/types/product.types"

export function CategoriesPage() {
  const user = useAuthStore((state) => state.user)
  const isOwner = user?.role === "OWNER"

  const { data: categories = [], isLoading } = useCategories()
  const createCategory = useCreateCategory()
  const deleteCategory = useDeleteCategory()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [categoryName, setCategoryName] = useState("")
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!categoryName.trim()) return

    createCategory.mutate(categoryName, {
      onSuccess: () => {
        setCategoryName("")
        setDialogOpen(false)
      },
    })
  }

  const handleDeleteConfirm = () => {
    if (deleteId) {
      deleteCategory.mutate(deleteId, {
        onSuccess: () => {
          setDeleteId(null)
        },
      })
    }
  }

  const columns: ColumnDef<Category>[] = useMemo(
    () => [
      {
        id: "index",
        header: "#",
        cell: ({ row }) => (
          <span className="font-mono text-muted-foreground">
            {row.index + 1}
          </span>
        ),
      },
      {
        accessorKey: "name",
        header: "Nama Kategori",
        cell: ({ getValue }) => (
          <span className="font-semibold">{getValue() as string}</span>
        ),
      },
      {
        id: "actions",
        header: () => <div className="text-right">Aksi</div>,
        cell: ({ row }) => {
          if (!isOwner) return null
          return (
            <div className="flex justify-end">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => setDeleteId(row.original.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )
        },
      },
    ],
    []
  )

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Kategori Produk
          </h1>
          <p className="text-sm text-muted-foreground">
            Kelola kategori untuk pengelompokan produk dan jasa.
          </p>
        </div>

        {isOwner && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger
              render={
                <Button>
                  <FolderPlus className="mr-2 h-4 w-4" />
                  Tambah Kategori
                </Button>
              }
            />
            <DialogContent className="sm:max-w-[425px]">
              <form onSubmit={handleCreate}>
                <DialogHeader>
                  <DialogTitle>Tambah Kategori</DialogTitle>
                  <DialogDescription>
                    Masukkan nama kategori baru untuk mengelompokkan produk atau
                    jasa.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Nama Kategori</Label>
                    <Input
                      id="name"
                      placeholder="Contoh: Oli, Ban, Jasa Servis"
                      value={categoryName}
                      onChange={(e) => setCategoryName(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                  >
                    Batal
                  </Button>
                  <Button type="submit" disabled={createCategory.isPending}>
                    {createCategory.isPending ? "Menyimpan..." : "Simpan"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <DataTable
        columns={columns}
        data={categories}
        isLoading={isLoading}
        emptyMessage="Belum ada kategori. Tambahkan kategori pertama Anda."
        searchPlaceholder="Cari nama kategori..."
        searchColumnId="name"
      />

      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Kategori ini akan dihapus
              secara permanen dari database. Produk yang terhubung dengan
              kategori ini akan diubah kategorinya menjadi tidak berkategori.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              className="text-destructive-foreground bg-destructive hover:bg-destructive/90"
              onClick={handleDeleteConfirm}
              disabled={deleteCategory.isPending}
            >
              {deleteCategory.isPending ? "Menghapus..." : "Hapus Kategori"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
