import { api } from "@/lib/axios"
import type { Category } from "@/types/product.types"

export const categoriesApi = {
  async getAll(): Promise<Category[]> {
    const response = await api.get("/categories")
    return response.data.data
  },

  async create(name: string): Promise<Category> {
    const response = await api.post("/categories", { name })
    return response.data.data
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/categories/${id}`)
  },
}
