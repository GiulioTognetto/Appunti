// config/remarkWikiLink.ts
import { sha256 } from 'js-sha256'

// Normalizza qualsiasi stringa (rimuove accenti, spazi extra, minuscolo)
export const normalizeString = (str: string): string =>
  str
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

// Genera l'hash SHA-256 univoco a 10 caratteri
export const generateHash = (str: string): string =>
  sha256(normalizeString(str)).substring(0, 10)

export const wikiLinkOptions = {
  aliasDivider: '|',

  pageResolver: (name: string) => {
    const rawTarget = (name.split('|')[0] ?? '').trim()

    // Calcola l'hash della stringa così com'è scritta nel wikilink
    const hash = generateHash(rawTarget)

    return [`p/${hash}`]
  },

  hrefTemplate: (permalink: string) => `/${permalink}`
}