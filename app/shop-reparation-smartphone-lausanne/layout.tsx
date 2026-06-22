import CartDrawer from '@/components/shop/CartDrawer'
import { SHOP_ENABLED } from '@/lib/config/features'

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      {SHOP_ENABLED && <CartDrawer />}
    </>
  )
}
