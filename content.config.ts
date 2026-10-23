import { defineContentConfig, defineCollection } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    content: defineCollection({
      type: 'page',
      source: {
        cwd: process.env.CONTENT_DIR || undefined,
        include: '**',
        exclude: [
          '**/.*',
          "templates/**",
          "**/attachments/**",
          'LICENSE',
        ]
      },
    }),
  },
})
