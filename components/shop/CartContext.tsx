'use client'

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useState,
  useCallback,
} from 'react'
import { SHOP_PRODUCTS, isProductPurchasable } from '@/data/shopProducts'

/* ── Types ─────────────────────────────────────────────────────── */

export interface CartItem {
  productId: string
  quantity:  number
}

interface CartState {
  items:  CartItem[]
  isOpen: boolean
}

type CartAction =
  | { type: 'ADD';    productId: string }
  | { type: 'REMOVE'; productId: string }
  | { type: 'UPDATE'; productId: string; qty: number }
  | { type: 'CLEAR' }
  | { type: 'OPEN'  }
  | { type: 'CLOSE' }
  | { type: 'LOAD';   items: CartItem[] }

export interface CartContextValue {
  items:      CartItem[]
  totalItems: number
  totalPrice: number   // CHF
  isOpen:     boolean
  addItem:    (productId: string) => void
  removeItem: (productId: string) => void
  updateQty:  (productId: string, qty: number) => void
  clearCart:  () => void
  openCart:   () => void
  closeCart:  () => void
}

/* ── Reducer ────────────────────────────────────────────────────── */

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD': {
      const existing = state.items.find(i => i.productId === action.productId)
      if (existing) {
        return {
          ...state,
          items: state.items.map(i =>
            i.productId === action.productId
              ? { ...i, quantity: i.quantity + 1 }
              : i
          ),
        }
      }
      return { ...state, items: [...state.items, { productId: action.productId, quantity: 1 }] }
    }
    case 'REMOVE':
      return { ...state, items: state.items.filter(i => i.productId !== action.productId) }
    case 'UPDATE':
      if (action.qty <= 0)
        return { ...state, items: state.items.filter(i => i.productId !== action.productId) }
      return {
        ...state,
        items: state.items.map(i =>
          i.productId === action.productId ? { ...i, quantity: action.qty } : i
        ),
      }
    case 'CLEAR':
      return { ...state, items: [] }
    case 'OPEN':
      return { ...state, isOpen: true }
    case 'CLOSE':
      return { ...state, isOpen: false }
    case 'LOAD':
      return { ...state, items: action.items }
    default:
      return state
  }
}

/* ── Context ────────────────────────────────────────────────────── */

const CartContext = createContext<CartContextValue | null>(null)

const STORAGE_KEY = 'clikclak-cart-v1'

/* ── Provider ───────────────────────────────────────────────────── */

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [], isOpen: false })
  const [hydrated, setHydrated] = useState(false)

  /* Hydratation depuis localStorage (une seule fois au montage) */
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as CartItem[]
        const valid  = parsed.filter(item => {
          const product = SHOP_PRODUCTS.find(p => p.id === item.productId)
          return product && isProductPurchasable(product) && item.quantity > 0
        })
        if (valid.length > 0) dispatch({ type: 'LOAD', items: valid })
      }
    } catch { /* ignore */ }
    setHydrated(true)
  }, [])

  /* Persistance dans localStorage à chaque modification */
  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items))
    } catch { /* ignore */ }
  }, [state.items, hydrated])

  const addItem    = useCallback((productId: string) => dispatch({ type: 'ADD',    productId }), [])
  const removeItem = useCallback((productId: string) => dispatch({ type: 'REMOVE', productId }), [])
  const updateQty  = useCallback((productId: string, qty: number) => dispatch({ type: 'UPDATE', productId, qty }), [])
  const clearCart  = useCallback(() => dispatch({ type: 'CLEAR' }), [])
  const openCart   = useCallback(() => dispatch({ type: 'OPEN'  }), [])
  const closeCart  = useCallback(() => dispatch({ type: 'CLOSE' }), [])

  const totalItems = state.items.reduce((sum, i) => sum + i.quantity, 0)
  const totalPrice = state.items.reduce((sum, i) => {
    const product = SHOP_PRODUCTS.find(p => p.id === i.productId)
    return sum + (product?.price ?? 0) * i.quantity
  }, 0)

  return (
    <CartContext.Provider value={{
      items:  state.items,
      totalItems,
      totalPrice,
      isOpen: state.isOpen,
      addItem,
      removeItem,
      updateQty,
      clearCart,
      openCart,
      closeCart,
    }}>
      {children}
    </CartContext.Provider>
  )
}

/* ── Hook ───────────────────────────────────────────────────────── */

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart doit être utilisé dans un CartProvider')
  return ctx
}
