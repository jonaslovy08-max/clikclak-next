import CartDrawer from '@/components/shop/CartDrawer'

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <CartDrawer />
    </>
  )
}
