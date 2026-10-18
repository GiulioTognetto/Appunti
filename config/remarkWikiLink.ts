export const wikiLinkOptions = {
  aliasDivider: '|',
  pageResolver: (name: string) => {
    // 1. Prende solo il percorso del file ignorando l'alias dopo '|'
    const cleanName = name.split('|')[0] ?? ''.trim()

    // 2. Mappa ciascun segmento del percorso
    const pathSegments = cleanName
      .split('/')
      .map((segment) =>
        segment
          .toLowerCase()
          .trim()
          // Normalizza i caratteri accentati (es. "Università" -> "Universita")
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          // Sostituisce gli spazi con trattini
          .replace(/\s+/g, '-')
          // Rimuove tutti i caratteri speciali rimanenti
          .replace(/[^a-z0-9\-]/g, '')
      )

    return [pathSegments.join('/')]
  },
  hrefTemplate: (permalink: string) => `/${permalink}`
}