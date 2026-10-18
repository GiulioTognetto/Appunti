// config/markdown.ts
export const wikiLinkOptions = {
  aliasDivider: '|',

  // pageResolver: lavora con stringhe IN CHIARO per matchare il file system
  pageResolver: (name: string) => {
    const rawTarget = (name.split('|')[0] ?? '').trim()

    // Normalizziamo solo il case (lowercase) per matchare il comportamento case-insensitive di Obsidian
    const cleanPath = rawTarget
      .split('/')
      .map((segment) => segment.trim())
      .join('/')

    if (rawTarget.includes('/')) {
      return [cleanPath]
    }

    return [`./${cleanPath}`, cleanPath]
  },

  // hrefTemplate: trasforma la stringa in un URL HTML valido
  hrefTemplate: (permalink: string) => {
    // encodeURI codifica spazi e caratteri speciali per l'HTML (es. spazi -> %20)
    // senza intaccare i caratteri di struttura dell'URL come '/' e './'
    const encoded = encodeURI(permalink)

    if (encoded.startsWith('./') || encoded.startsWith('../')) {
      return encoded
    }
    return `/${encoded}`
  }
}