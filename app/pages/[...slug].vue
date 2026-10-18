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

// slug è un array contenente i segmenti del percorso (es. ['p', 'valore-assoluto-a1b2c3d4'] oppure ['appunti', 'scuola', 'home'])
const slugSegments = (route.params.slug as string[]) || []

// Verifica se la rotta inizia con 'p' e contiene lo slug con l'hash
const isHashRoute = slugSegments[0] === 'p' && slugSegments.length > 1
const rawSlugParam = isHashRoute ? slugSegments[1] : null

// Estrae solo i 10 caratteri dell'hash finale da una stringa tipo "valore-assoluto-a1b2c3d4"
const targetHash = computed(() => {
  if (!rawSlugParam) return null
  
  // Se la stringa contiene un trattino, prende l'ultima parte
  const parts = rawSlugParam.split('-')
  return parts.pop() || rawSlugParam
})

const currentPathQuery = (route.query.from as string) || ''

const { data: page } = await useAsyncData(`content-${route.path}`, async () => {
  const allDocs = await queryCollection('content').all()

  // SCENARIO 1: L'URL è nella forma /p/seo-slug-hash
  if (targetHash.value) {
    const hashToMatch = targetHash.value

    // 1. Match sull'HASH del percorso completo
    const exactMatch = allDocs.find((doc) => generateHash(doc.path) === hashToMatch)
    if (exactMatch) return exactMatch

    // 2. Match contestuale (risale le cartelle dalla provenienza ?from=...)
    if (currentPathQuery) {
      const pathSegments = currentPathQuery.split('/').filter(Boolean)
      pathSegments.pop()

      while (pathSegments.length > 0) {
        const parentDir = '/' + pathSegments.join('/')
        const contextualMatch = allDocs.find((doc) => {
          const isInSameDir = doc.path.startsWith(parentDir)
          const fileName = doc.path.split('/').pop() ?? ''
          return isInSameDir && generateHash(fileName) === hashToMatch
        })

        if (contextualMatch) return contextualMatch
        pathSegments.pop()
      }
    }

    // 3. Fallback globale sull'hash del nome del file
    return allDocs.find((doc) => {
      const fileName = doc.path.split('/').pop() ?? ''
      return generateHash(fileName) === hashToMatch
    }) || null
  }

  // SCENARIO 2: L'URL è un percorso standard (es. /appunti/universita/analisi)
  return await queryCollection('content').path(route.path).first()
})

if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Nota non trovata' })
}
</script>