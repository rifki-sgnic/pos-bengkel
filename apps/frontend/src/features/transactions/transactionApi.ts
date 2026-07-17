import { api } from "@/lib/axios"
import type {
  CreateTransactionPayload,
  Transaction,
  TransactionListParams,
  TransactionListResponse,
} from "@/types/transaction.types"

export const transactionsApi = {
  async getAll(
    params: TransactionListParams
  ): Promise<TransactionListResponse> {
    const response = await api.get("/transactions", { params })
    return response.data
  },

  async getByid(id: string): Promise<Transaction> {
    const response = await api.get(`/transactions/${id}`)
    return response.data.data
  },

  async create(payload: CreateTransactionPayload): Promise<Transaction> {
    const response = await api.post("/transactions", payload)
    return response.data.data
  },

  async void(id: string, voidReason: string): Promise<Transaction> {
    const response = await api.patch(`/transactions/${id}/void`, {
      voidReason,
    })
    return response.data.data
  },
}
