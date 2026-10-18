// config/remarkWikiLink.ts
import { sha256 } from 'js-sha256'

// Normalizza la stringa rimuovendo accenti, spazi e caratteri speciali
export const normalizeString = (str: string): string =>
  str
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

// Genera uno slug pulito ed elegante per la SEO (es. "Valore Assoluto" -> "valore-assoluto")
export const slugify = (str: string): string => {
  const fileName = str.split('/').pop() ?? str

  return normalizeString(fileName)
    .replace(/[\u2010-\u2015\u2212]/g, '-')
    .replace(/[\s\uA000\u1680\u2000-\u200A\u202F\u205F\u3000]+/g, '-')
    .replace(/[()\[\]{}.,:;!?'"`~@#$%^&*+=|<>\/\\°]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Genera l'hash SHA-256 deterministico a 10 caratteri dal percorso del file
export const generateHash = (str: string): string =>
  sha256(normalizeString(str)).substring(0, 10)

export const wikiLinkOptions = {
  aliasDivider: '|',

  pageResolver: (name: string) => {
    // 1. Prende il percorso del file ignorando l'alias dopo '|'
    const rawTarget = (name.split('|')[0] ?? '').trim()

    // 2. Genera lo slug umano per la SEO dal nome del file
    const seoSlug = slugify(rawTarget)

    // 3. Genera l'hash univoco basato sul percorso completo
    const hash = generateHash(rawTarget)

    // Unisce lo slug umano con l'hash a 10 caratteri
    const fullSlug = seoSlug ? `${seoSlug}-${hash}` : hash

    return [`/${fullSlug}`]
  },

  hrefTemplate: (permalink: string) => `/${permalink}`
}