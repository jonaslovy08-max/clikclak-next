/*
  icecatClient.ts — client Open Icecat (server-side uniquement)

  Utilise les variables d'environnement :
    ICECAT_USERNAME  — jamais exposé côté client
    ICECAT_PASSWORD  — jamais exposé côté client

  Endpoints testés :
    - REST API v2 : GET https://icecat.biz/api/products?lang=EN&Brand=X&Name=Y
    - URL legacy   : GET https://icecat.biz/index.cgi?shopname=X&prod_id=Y&vendorname=Z&lang=EN

  IMPORTANT : ne jamais importer ce module dans un composant 'use client'.
*/

export interface IcecatSearchParams {
  brand:   string
  name:    string
  lang?:   string
  mpn?:    string
  ean?:    string
}

export interface IcecatProductSummary {
  productId:    number | string
  name:         string
  brand:        string
  description?: string
  imageHigh?:   string
  imageLow?:    string
  imageCount:   number
  specsCount:   number
  lang:         string
  found:        boolean
  raw?:         unknown
}

const BASE_REST = 'https://icecat.biz/api'

function getAuth(): string {
  const user = process.env.ICECAT_USERNAME
  const pass = process.env.ICECAT_PASSWORD
  if (!user || !pass) throw new Error('ICECAT_USERNAME / ICECAT_PASSWORD manquants dans .env.local')
  return 'Basic ' + Buffer.from(`${user}:${pass}`).toString('base64')
}

export async function searchIcecatProduct(
  params: IcecatSearchParams
): Promise<IcecatProductSummary> {
  const { brand, name, lang = 'FR', mpn, ean } = params
  const auth = getAuth()

  const query = new URLSearchParams({ lang, Brand: brand, Name: name })
  if (mpn) query.set('prod_id', mpn)
  if (ean) query.set('ean', ean)

  const url = `${BASE_REST}/products?${query.toString()}`

  const res = await fetch(url, {
    headers: {
      Authorization: auth,
      Accept:        'application/json',
    },
    next: { revalidate: 0 },
  })

  if (!res.ok) {
    return {
      productId:  '',
      name:       params.name,
      brand:      params.brand,
      imageCount: 0,
      specsCount: 0,
      lang,
      found:      false,
      raw:        { status: res.status, statusText: res.statusText },
    }
  }

  const json = await res.json() as {
    products?: Array<{
      product_id?: number
      Name?:       string
      Vendorname?: string
      ShortDesc?:  string
      LowImg?:     string
      HighImg?:    string
      images?:     unknown[]
      featuresGroups?: unknown[]
    }>
  }

  const products = json.products ?? []
  if (products.length === 0) {
    return {
      productId:  '',
      name:       params.name,
      brand:      params.brand,
      imageCount: 0,
      specsCount: 0,
      lang,
      found:      false,
      raw:        json,
    }
  }

  const p = products[0]
  return {
    productId:  p.product_id ?? '',
    name:       p.Name ?? params.name,
    brand:      p.Vendorname ?? params.brand,
    description: p.ShortDesc,
    imageLow:   p.LowImg,
    imageHigh:  p.HighImg,
    imageCount: Array.isArray(p.images) ? p.images.length : (p.LowImg ? 1 : 0),
    specsCount: Array.isArray(p.featuresGroups) ? p.featuresGroups.length : 0,
    lang,
    found:      true,
    raw:        json,
  }
}
