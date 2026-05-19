'use client'

import { Button } from '@/components/ui/Button'
import { useCart } from './CartContext'

interface Props {
  productId: string
  size?:     'sm' | 'md' | 'lg'
  className?: string
}

/*
  Bouton "Acheter" — même style visuel que le bouton "Réparer" de la homepage
  (Button variant="primary" → shiny-cta shiny-cta-primary).
*/
export default function AddToCartButton({ productId, size = 'md', className }: Props) {
  const { addItem, openCart } = useCart()

  return (
    <Button
      variant="primary"
      size={size}
      className={className}
      onClick={() => {
        addItem(productId)
        openCart()
      }}
    >
      Acheter
    </Button>
  )
}
