import { sha256 } from 'js-sha256'

// Normalizza la stringa rimuovendo accenti, spazi e caratteri speciali
export const normalizeString = (str: string): string =>
  str
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

// Genera uno slug pulito per la leggibilità e la SEO (es. "Valore Assoluto" -> "valore-assoluto")
export const slugify = (str: string): string => {
  // Estrae l'ultimo segmento se è presente un percorso (es. da "TOLC-I/Valore Assoluto" prende "Valore Assoluto")
  const fileName = str.split('/').pop() ?? str

  return normalizeString(fileName)
    .replace(/[\u2010-\u2015\u2212]/g, '-')
    .replace(/[\s\uA000\u1680\u2000-\u200A\u202F\u205F\u3000]+/g, '-')
    .replace(/[()\[\]{}.,:;!?'"`~@#$%^&*+=|<>\/\\°]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Genera l'hash SHA-256 univoco a 10 caratteri
export const generateHash = (str: string): string =>
  sha256(normalizeString(str)).substring(0, 10)

export const wikiLinkOptions = {
  aliasDivider: '|',

  pageResolver: (name: string) => {
    // 1. Estrae la parte del percorso prima del '|'
    const rawTarget = (name.split('|')[0] ?? '').trim()

    // 2. Genera lo slug umano per la SEO
    const seoSlug = slugify(rawTarget)

    // 3. Genera l'hash deterministico univoco
    const hash = generateHash(rawTarget)

    // Se lo slug è vuoto (es. se la stringa conteneva solo simboli), usa solo l'hash
    const fullSlug = seoSlug ? `${seoSlug}-${hash}` : hash

    return [`p/${fullSlug}`]
  },

  hrefTemplate: (permalink: string) => `/${permalink}`
}