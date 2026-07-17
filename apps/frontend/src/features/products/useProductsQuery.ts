import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { productsApi } from "./productsApi"
import type {
  CreateProductPayload,
  ProductListParams,
  UpdateProductPayload,
} from "@/types/product.types"
import { toast } from "sonner"

export function useProducts(params: ProductListParams) {
  return useQuery({
    queryKey: ["products", params],
    queryFn: () => productsApi.getAll(params),
    placeholderData: keepPreviousData,
  })
}

export function useLowStockProducts() {
  return useQuery({
    queryKey: ["products", "low-stock"],
    queryFn: productsApi.getLowStock,
  })
}

export function useCreateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateProductPayload) => productsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] })
      toast.success("Produk berhasil ditambahkan")
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message ?? "Gagal menambahkan produk")
    },
  })
}

export function useUpdateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: UpdateProductPayload
    }) => productsApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] })
      toast.success("Produk berhasil diupdate")
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message ?? "Gagal update produk")
    },
  })
}

export function useDeactivateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => productsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] })
      toast.success("Produk berhasil dinonaktifkan")
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message ?? "Gagal menonaktifkan produk")
    },
  })
}
