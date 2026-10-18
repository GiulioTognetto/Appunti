// https://nuxt.com/docs/api/configuration/nuxt-config
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
    database: {
      type: 'sqlite',
      filename: ':memory:'
    }
  },

  nitro: {
    prerender: {
      failOnError: false
    }
  }
})
