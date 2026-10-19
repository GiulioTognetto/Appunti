// config/remarkWikiLink.ts
import remarkWikiLink from 'remark-wiki-link'

export const wikiLinkOptions = {
  aliasDivider: '|',

  pageResolver: (name: string) => {
    // 1. Prende solo il percorso prima del '|' (ignorando l'alias)
    const rawTarget = (name.split('|')[0] ?? '').trim()

    // 2. Normalizza ciascun segmento del percorso (lowercase, rimuove accenti e trasforma spazi/simboli in '-')
    const slugifySegment = (segment: string) =>
      segment
        .toLowerCase()
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // rimuove gli accenti ("università" -> "universita")
        .replace(/[\u2010-\u2015\u2212]/g, '-') // unifica i trattini
        .replace(/[\s\uA000\u1680\u2000-\u200A\u202F\u205F\u3000]+/g, '-') // spazi -> '-'
        .replace(/[()\[\]{}.,:;!?'"`~@#$%^&*+=|<>\/\\°]/g, '') // rimuove punteggiatura
        .replace(/-+/g, '-') // riduce trattini multipli ("--" -> "-")
        .replace(/^-+|-+$/g, '')

    let cleanPath = rawTarget
      .split('/')
      .map(slugifySegment)
      .filter(Boolean)
      .join('/')

    // Se finisce con '/index', lo rimuove per puntare alla cartella principale
    if (cleanPath.endsWith('/index')) {
      cleanPath = cleanPath.slice(0, -6)
    }

    return [cleanPath]
  },

  hrefTemplate: (permalink: string) => {
    if (permalink.startsWith('/')) {
      return permalink
    }
    return `/${permalink}`
  }
}