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
