// https://nuxt.com/docs/api/configuration/nuxt-config

import { setupDevVaultSymlink } from './config/devVaultSymlink'
import { wikiLinkOptions } from './config/remarkWikiLink'

// Se siamo in dev e NOTES_VAULT_PATH è impostato, collega temporaneamente la cartella content/
const cleanupSymlink = setupDevVaultSymlink()

export default defineNuxtConfig({
  modules: [
    '@nuxt/content',
    '@nuxt/a11y',
    '@nuxt/hints',
    '@nuxt/image',
    '@nuxt/scripts',
    '@nuxt/ui',
  ],
  css: ['~/assets/css/main.css'],
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
          'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: blob:; font-src 'self' data: https:; connect-src 'self' https: ws: wss:;"
        }
      }
    }
  },

  hooks: {
    close: () => {
      cleanupSymlink?.()
    }
  }
})
