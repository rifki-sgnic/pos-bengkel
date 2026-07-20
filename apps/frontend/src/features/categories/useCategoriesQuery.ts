import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { categoriesApi } from "./categoriesApi"

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: categoriesApi.getAll,
  })
}

export function useCreateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: categoriesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] })
      toast.success("Kategori berhasil ditambahkan")
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message ?? "Gagal menambahkan kategori")
    },
  })
}

export function useDeleteCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: categoriesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] })
      toast.success("Kategori berhasil dihapus")
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message ?? "Gagal menghapus kategori")
    },
  })
}
