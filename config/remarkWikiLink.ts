import remarkWikiLink from 'remark-wiki-link'

export const wikiLinkOptions = {
  aliasDivider: '|',
  pageResolver: (name: string) => {
    const cleanName = name.split('|')[0] ?? ''.trim()
    const pathSegments = cleanName
      .split('/')
      .map((segment) =>
        segment
          .toLowerCase()
          .trim()
          .replace(/\s+/g, '-')
          .replace(/[^\w\-]+/g, '')
      )
    return [pathSegments.join('/')]
  },
  hrefTemplate: (permalink: string) => `/${permalink}`
}