<template>
  <main class="note-container">
    <article v-if="page" class="prose">
      <h1>{{ page.title }}</h1>
      <ContentRenderer :value="page" />
    </article>
  </main>
</template>

<script setup lang="ts">
const route = useRoute()

// Query diretta a Nuxt Content basata sul percorso dell'URL
const { data: page } = await useAsyncData(`content-${route.path}`, () => {
  return queryCollection('content').path(route.path).first()
})

if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Nota non trovata' })
}
</script>