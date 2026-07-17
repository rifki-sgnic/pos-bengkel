export type ProductType = "PART" | "JASA"

export interface Category {
  id: string
  name: string
}

export interface Product {
  id: string
  name: string
  sku: string | null
  type: ProductType
  costPrice?: number
  sellPrice: number
  stock: number
  minStock: number
  isActive: boolean
  categoryId: string | null
  category?: Category
}

export interface CreateProductPayload {
  name: string
  sku?: string
  type: ProductType
  costPrice: number
  sellPrice: number
  stock?: number
  minStock?: number
  categoryId?: string
}

export interface UpdateProductPayload {
  name?: string
  sku?: string
  type?: ProductType
  costPrice?: number
  sellPrice?: number
  stock?: number
  minStock?: number
  categoryId?: string
  isActive?: boolean
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface ProductListParams {
  page?: number
  limit?: number
  search?: string
  sortBy?: "name" | "sellPrice" | "costPrice" | "stock" | null
  sortOrder?: "asc" | "desc"
  type?: ProductType
  categoryId?: string
}

export interface ProductListResponse {
  data: Product[]
  meta: PaginationMeta
}
