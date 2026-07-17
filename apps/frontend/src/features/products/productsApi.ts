import { api } from "@/lib/axios"
import type {
  CreateProductPayload,
  Product,
  ProductListParams,
  ProductListResponse,
  UpdateProductPayload,
} from "@/types/product.types"

export const productsApi = {
  async getAll(params: ProductListParams): Promise<ProductListResponse> {
    const response = await api.get("/products", { params })
    return response.data
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

  async getLowStock(): Promise<Product[]> {
    const response = await api.get("/products/low-stock")
    return response.data.data
  },
}
