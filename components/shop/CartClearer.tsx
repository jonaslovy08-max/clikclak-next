'use client'

import { useEffect } from 'react'
import { useCart } from './CartContext'

/* Vide le panier côté client au montage — utilisé sur la page success */
export default function CartClearer() {
  const { clearCart } = useCart()
  useEffect(() => { clearCart() }, [clearCart])
  return null
}
