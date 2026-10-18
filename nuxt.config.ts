// https://nuxt.com/docs/api/configuration/nuxt-config

import remarkWikiLink from 'remark-wiki-link'
import { wikiLinkOptions } from './config/remarkWikiLink'

export default defineNuxtConfig({
  modules: [
    '@nuxt/content',
    '@nuxt/a11y',
    '@nuxt/hints',
    '@nuxt/image',
    '@nuxt/scripts',
    '@nuxt/ui',
  ],
  devtools: { enabled: true },
  compatibilityDate: '2024-04-03',

  app: {
    baseURL: process.env.NUXT_APP_BASE_URL || '/'
  },

  content: {
    build: {
      markdown: {
        remarkPlugins: {
          'remark-wiki-link': {
            src: remarkWikiLink,
            options: wikiLinkOptions
          }
        }
      }
    },
    database: {
      type: 'sqlite',
      filename: ':memory:'
    }
  },

  nitro: {
    prerender: {
      failOnError: false
    },
    routeRules: {
      '/**': {
        headers: {
          'Content-Security-Policy': "default-src 'self'; connect-src 'self' https:;"
        }
      }
    }
  }
})
