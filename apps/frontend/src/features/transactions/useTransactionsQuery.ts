import type { CreateTransactionPayload } from "@/types/transaction.types"
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { toast } from "sonner"
import { transactionsApi } from "./transactionApi"
import type { TransactionListParams } from "@/types/transaction.types"

export function useTransactions(params: TransactionListParams) {
  return useQuery({
    queryKey: ["transactions", params],
    queryFn: () => transactionsApi.getAll(params),
    placeholderData: keepPreviousData,
  })
}

export function useCreateTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateTransactionPayload) =>
      transactionsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] })
      queryClient.invalidateQueries({ queryKey: ["products"] })
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message ?? "Transaksi gagal")
    },
  })
}

export function useVoidTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, voidReason }: { id: string; voidReason: string }) =>
      transactionsApi.void(id, voidReason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] })
      queryClient.invalidateQueries({ queryKey: ["products"] })
      toast.success("Transaksi berhasil dibatalkan")
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ?? "Pembatalan transaksi gagal"
      )
    },
  })
}
