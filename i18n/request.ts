import { getRequestConfig } from 'next-intl/server'
import { headers } from 'next/headers'
import type { Locale } from './routing'

export default getRequestConfig(async () => {
  // Locale dérivée du header x-pathname posé par le middleware
  const headerStore = await headers()
  const pathname    = headerStore.get('x-pathname') ?? '/'
  const locale: Locale = pathname.startsWith('/en') ? 'en' : 'fr'

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  }
})
