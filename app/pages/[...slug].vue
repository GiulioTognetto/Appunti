<template>
  <main class="note-container">
    <article v-if="page" class="prose">
      <h1>{{ page.title }}</h1>
      <ContentRenderer :value="page" />
    </article>
  </main>
</template>

<script setup lang="ts">
import { generateHash } from '~/config/remarkWikiLink'

const route = useRoute()

// slug è un array contenente i segmenti del percorso (es. ['p', 'a1b2c3d4'] oppure ['appunti', 'scuola', 'home'])
const slugSegments = (route.params.slug as string[]) || []

// Verifica se la rotta inizia con 'p' e ha un hash come secondo parametro
const isHashRoute = slugSegments[0] === 'p' && slugSegments.length > 1
const targetHash = isHashRoute ? slugSegments[1] : null
const currentPathQuery = (route.query.from as string) || ''

const { data: page } = await useAsyncData(`content-${route.path}`, async () => {
  const allDocs = await queryCollection('content').all()

  // SCENARIO 1: L'URL è nella forma /p/hash
  if (targetHash) {
    // 1. Match sull'HASH del percorso completo
    const exactMatch = allDocs.find((doc) => generateHash(doc.path) === targetHash)
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
          return isInSameDir && generateHash(fileName) === targetHash
        })

        if (contextualMatch) return contextualMatch
        pathSegments.pop()
      }
    }

    // 3. Fallback globale sull'hash del nome del file
    return allDocs.find((doc) => {
      const fileName = doc.path.split('/').pop() ?? ''
      return generateHash(fileName) === targetHash
    }) || null
  }

  // SCENARIO 2: L'URL è un percorso standard (es. /appunti/universita/analisi)
  return await queryCollection('content').path(route.path).first()
})

if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Nota non trovata' })
}
</script>