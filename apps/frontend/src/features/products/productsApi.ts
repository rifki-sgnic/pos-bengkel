import { api } from "@/lib/axios"
import type {
  CreateProductPayload,
  Product,
  UpdateProductPayload,
} from "@/types/product.types"

export const productsApi = {
  async getAll(): Promise<Product[]> {
    const response = await api.get("/products")
    return response.data.data
  },

  async create(payload: CreateProductPayload): Promise<Product> {
    const response = await api.post("/products", payload)
    return response.data.data
  },

  async update(id: string, payload: UpdateProductPayload): Promise<Product> {
    const response = await api.patch(`/products/${id}`, payload)
    return response.data.data
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/products/${id}`)
  },
}
