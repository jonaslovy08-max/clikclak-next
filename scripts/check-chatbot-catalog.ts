#!/usr/bin/env tsx

import { loadEnvConfig } from '@next/env'

loadEnvConfig(process.cwd())

import { getRepairCatalog } from '../lib/chatbot/repairCatalogCache'

async function main(): Promise<void> {
  const brands = await getRepairCatalog()

  for (const brand of brands) {
    console.log({
      slug: brand.slug,
      name: brand.name,
      public_base_path: brand.public_base_path,
      families: brand.families.length,
    })
  }
}

main().catch((error: unknown) => {
  console.error(error)
  process.exit(1)
})
