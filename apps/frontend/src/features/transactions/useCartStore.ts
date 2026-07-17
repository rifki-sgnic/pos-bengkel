import type { Product } from "@/types/product.types"
import { create } from "zustand"

interface CartLine {
  product: Product
  quantity: number
}

interface CartState {
  items: CartLine[]
  addItem: (product: Product) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clear: () => void
}

export const useCartStore = create<CartState>((set) => ({
  items: [],

  addItem: (product) =>
    set((state) => {
      const existing = state.items.find(
        (line) => line.product.id === product.id
      )

      if (existing) {
        return {
          items: state.items.map((line) =>
            line.product.id === product.id
              ? { ...line, quantity: line.quantity + 1 }
              : line
          ),
        }
      }

      return { items: [...state.items, { product, quantity: 1 }] }
    }),

  removeItem: (productId) =>
    set((state) => ({
      items: state.items.filter((line) => line.product.id !== productId),
    })),

  updateQuantity: (productId, quantity) =>
    set((state) => {
      if (quantity <= 0) {
        return {
          items: state.items.filter((line) => line.product.id !== productId),
        }
      }
      return {
        items: state.items.map((line) =>
          line.product.id === productId ? { ...line, quantity } : line
        ),
      }
    }),

  clear: () => set({ items: [] }),
}))
