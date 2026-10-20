import remarkWikiLink from 'remark-wiki-link'
import { wikiLinkOptions } from './config/remarkWikiLink'

export default {
  unified: {
    remark: (processor: any) => {
      processor.use(remarkWikiLink, wikiLinkOptions)
    }
  }
}

