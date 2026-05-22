// frontend/store/cartStore.ts
import { create } from "zustand";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  reviews: any[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  total: number;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  items: [],
  total: 0,
  addItem: (product, quantity = 1) =>
    set((state) => {
      const existingItem = state.items.find((item) => item.product.id === product.id);
      let newItems;
      if (existingItem) {
        newItems = state.items.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        newItems = [...state.items, { product, quantity }];
      }
      const newTotal = newItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
      return { items: newItems, total: newTotal };
    }),
  removeItem: (productId) =>
    set((state) => {
      const newItems = state.items.filter((item) => item.product.id !== productId);
      const newTotal = newItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
      return { items: newItems, total: newTotal };
    }),
  updateQuantity: (productId, quantity) =>
    set((state) => {
      const newItems = state.items.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      );
      const newTotal = newItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
      return { items: newItems, total: newTotal };
    }),
  clearCart: () => set({ items: [], total: 0 }),
}));
