// config/markdown.ts
export const wikiLinkOptions = {
  aliasDivider: '|',
  
  // pageResolver riceve la stringa dentro le doppie quadre [[...]]
  pageResolver: (name: string) => {
    // 1. Estrae la destinazione ignorando l'alias dopo '|'
    const cleanName = name.split('|')[0] ?? ''.trim()

    // Helper per trasformare qualsiasi stringa in uno slug pulito e normalizzato
    const slugifyify = (str: string) =>
      str
        .toLowerCase()
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // rimuove gli accenti
        .replace(/\s+/g, '-')             // sostituisce gli spazi con trattini
        .replace(/[^a-z0-9\-\/]/g, '')     // rimuove i caratteri speciali mantenendo i slash '/'

    // 2. Se il link contiene già un percorso esplicito (es. [[Scuola/Informatica/Appunti Generici]])
    if (cleanName.includes('/')) {
      return [slugifyify(cleanName)]
    }

    // 3. Se è un nome semplice (es. [[Appunti Generici]]), restituisce sia il percorso assoluto
    // sia la variante relativa che remark-wiki-link o il router di Nuxt proveranno a risolvere
    const targetSlug = slugifyify(cleanName)

    return [
      targetSlug,             // /appunti-generici
      `./${targetSlug}`       // ./appunti-generici (relativo alla cartella corrente)
    ]
  },

  hrefTemplate: (permalink: string) => {
    // Assicura che l'URL finale mantenga i percorsi relativi se presenti
    if (permalink.startsWith('./') || permalink.startsWith('../')) {
      return permalink
    }
    return `/${permalink}`
  }
}