// config/markdown.ts
export const wikiLinkOptions = {
  aliasDivider: '|',

  pageResolver: (name: string) => {
    // 1. Prende solo la destinazione del link ignorando l'alias dopo '|'
    const rawTarget = (name.split('|')[0] ?? '').trim()

    // 2. Mantiene il nome ESATTO del file/cartella, convertendo solo in minuscolo
    // per rispecchiare il comportamento case-insensitive di Obsidian e Nuxt Content
    const normalizeExactPath = (pathStr: string) =>
      pathStr
        .split('/')
        .map((segment) => segment.trim().toLowerCase())
        .join('/')

    const exactPath = normalizeExactPath(rawTarget)

    if (rawTarget.includes('/')) {
      return [exactPath]
    }

    // Restituisce il path relativo e assoluto senza alterare i caratteri (parentesi, spazi, ecc.)
    return [`./${exactPath}`, exactPath]
  },

  hrefTemplate: (permalink: string) => {
    // encodeURI garantisce che spazi e parentesi siano validi nell'HTML (es. "piramide%20retta%20(a%20base%20quadrata)")
    // senza modificare la struttura del nome del file
    const encoded = encodeURI(permalink)

    if (encoded.startsWith('./') || encoded.startsWith('../')) {
      return encoded
    }
    return `/${encoded}`
  }
}