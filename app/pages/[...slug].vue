<template>
  <main class="note-container">
    <article v-if="page" class="prose">
      <h1>{{ page.title }}</h1>
      <ContentRenderer :value="page" />
    </article>
  </main>
</template>

<script setup lang="ts">
import { sha256 } from 'js-sha256'

const normalizeString = (str: string): string =>
  str
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

const generateHash = (str: string): string =>
  sha256(normalizeString(str)).substring(0, 10)

const route = useRoute()
const slugSegments = (route.params.slug as string[]) || []

// Verifica se la rotta è nella forma /p/seo-slug-a1b2c3d479
const isHashRoute = slugSegments[0] === 'p' && slugSegments.length > 1
const rawSlugParam = isHashRoute ? slugSegments[1] : null

// Estrae gli ultimi 10 caratteri (l'hash SHA-256) dallo slug
const targetHash = computed(() => {
  if (!rawSlugParam) return null
  const parts = rawSlugParam.split('-')
  return parts.pop() || rawSlugParam
})

const { data: page } = await useAsyncData(`content-${route.path}`, async () => {
  const allDocs = await queryCollection('content').all()

  if (targetHash.value) {
    const hashToMatch = targetHash.value

    // Match esatto ed istantaneo sull'hash del percorso completo del documento
    const match = allDocs.find((doc) => generateHash(doc.path) === hashToMatch)
    if (match) return match
  }

  // Fallback per rotte trasparenti tradizionali (es. / o /appunti/...)
  return await queryCollection('content').path(route.path).first()
})

if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Nota non trovata' })
}
</script>