/*
  InterventionDeviceSelector — sélection d'appareil pour les pages d'intervention.
  Réutilise RepairDeviceSelector sans la carte "Récupération de données".
  headingLevel="h2" car les pages intervention ont déjà un H1.
*/

import RepairDeviceSelector from '@/components/repair/RepairDeviceSelector'

export default function InterventionDeviceSelector({ locale = 'fr' }: { locale?: 'fr' | 'en' }) {
  return (
    <RepairDeviceSelector
      hideRecuperation={true}
      headingLevel="h2"
      locale={locale}
    />
  )
}
