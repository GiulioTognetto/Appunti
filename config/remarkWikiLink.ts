// config/markdown.ts
export const wikiLinkOptions = {
  aliasDivider: '|',

  pageResolver: (name: string) => {
    const rawTarget = (name.split('|')[0] ?? '').trim()

    const slugifySegment = (segment: string) =>
      segment
        .toLowerCase()
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // "università" -> "universita"
        .replace(/\s+/g, '-')             // "scuola superiore" -> "scuola-superiore"
        .replace(/[^a-z0-9\-]/g, '')     // rimuove caratteri speciali rimasti

    const cleanPath = rawTarget
      .split('/')
      .map(slugifySegment)
      .filter(Boolean)
      .join('/')

    if (rawTarget.includes('/')) {
      return [cleanPath]
    }

    return [`./${cleanPath}`, cleanPath]
  },

  hrefTemplate: (permalink: string) => {
    // NON aggiungere il baseURL qui! Ci pensa già Nuxt/Router automaticamente.
    if (permalink.startsWith('./') || permalink.startsWith('../')) {
      return permalink
    }
    return `/${permalink}`
  }
}