// config/markdown.ts
export const wikiLinkOptions = {
  aliasDivider: '|',

  pageResolver: (name: string) => {
    // 1. Estrae solo il percorso del file ignorando l'alias dopo '|'
    const rawTarget = (name.split('|')[0] ?? '').trim()

    // Funzione di slugify universale ed esaustiva
    const slugifySegment = (segment: string) =>
      segment
        .toLowerCase()
        .trim()
        // Separazione dei caratteri accentati (es. "à" -> "a" + accento)
        .normalize('NFD')
        // Rimozione dei diacritici/accenti
        .replace(/[\u0300-\u036f]/g, '')
        // Conversione di trattini tipografici (en-dash, em-dash, hyphen) in '-'
        .replace(/[\u2010-\u2015\u2212]/g, '-')
        // Conversione di spazi normali, spazi non interrompibili e tab in '-'
        .replace(/[\s\uA000\u1680\u2000-\u200A\u202F\u205F\u3000]+/g, '-')
        // Rimozione di parentesi, punteggiatura e simboli matematici/speciali
        .replace(/[()\[\]{}.,:;!?'"`~@#$%^&*+=|<>\/\\°]/g, '')
        // Rimozione di caratteri di controllo non stampabili
        .replace(/[\x00-\x1F\x7F-\x9F]/g, '')
        // Compressione di tutti i trattini multipli consecutivi in un trattino singolo
        .replace(/-+/g, '-')
        // Rimozione dei trattini a inizio e fine segmento
        .replace(/^-+|-+$/g, '')

    // 2. Mantiene la struttura delle sotto-cartelle processando ogni segmento separatamente
    const cleanPath = rawTarget
      .split('/')
      .map(slugifySegment)
      .filter(Boolean)
      .join('/')

    // Se il link contiene un percorso esplicito (es. [[Scuola/Quinta/Informatica]])
    if (rawTarget.includes('/')) {
      return [cleanPath]
    }

    // Altrimenti restituisce sia la variante relativa sia quella con root fallback
    return [`./${cleanPath}`, cleanPath]
  },

  hrefTemplate: (permalink: string) => {
    // Mantiene la navigazione relativa per il router di Nuxt
    if (permalink.startsWith('./') || permalink.startsWith('../')) {
      return permalink
    }
    return `/${permalink}`
  }
}