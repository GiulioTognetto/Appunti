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
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[\s\uA000\u1680\u2000-\u200A\u202F\u205F\u3000]+/g, '-')
        .replace(/[()\[\]{}.,:;!?'"`~@#$%^&*+=|<>\/\\°]/g, '')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '')

    const cleanPath = rawTarget
      .split('/')
      .map(slugifySegment)
      .filter(Boolean)
      .join('/')

    return [cleanPath]
  },

  hrefTemplate: (permalink: string) => permalink
}