/*
  RepairPageLayout — wrapper serveur partagé pour les pages de réparation.
  Fournit : Header | children | RepairEngagements | SiteFooter | SectionPinning
*/

import Header from '@/components/layout/Header'
import SiteFooter from '@/components/home/SiteFooter'
import SectionPinning from '@/components/ui/SectionPinning'
import RepairEngagements from './RepairEngagements'

export default function RepairPageLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <RepairEngagements />
      <SiteFooter />
      <SectionPinning />
    </>
  )
}
