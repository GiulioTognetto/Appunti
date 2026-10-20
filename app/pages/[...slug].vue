<!-- app/pages/[...slug].vue -->
<script setup lang="ts">
const route = useRoute()

// Calcola se siamo sulla pagina iniziale (Home/Index)
const isHome = computed(() => route.path === '/' || route.path === '' || route.path === '/index')

// Query per la pagina corrente con risoluzione avanzata dei percorsi
const { data: page } = await useAsyncData(`content-${route.path}`, async () => {
  const currentPath = decodeURIComponent(route.path)

  if (isHome.value) {
    const rootIndex = await queryCollection('content').path('/').first()
    if (rootIndex) return rootIndex
    return queryCollection('content').path('/index').first()
  }

  // 1. Cerca per path esatto
  let found = await queryCollection('content').path(currentPath).first()
  if (found) return found

  // 2. Cerca per path minuscolo
  found = await queryCollection('content').path(currentPath.toLowerCase()).first()
  if (found) return found

  // 3. Cerca con o senza slash finale
  const altPath = currentPath.endsWith('/') ? currentPath.slice(0, -1) : `${currentPath}/`
  found = await queryCollection('content').path(altPath).first()
  if (found) return found

  // 4. Se è una cartella con index (es. /cartella -> /cartella/index)
  found = await queryCollection('content').path(`${currentPath.replace(/\/$/, '')}/index`).first()
  if (found) return found

  // 5. Cerca per slug/stem finale (per link markdown o wikilinks che omettono la cartella)
  const slug = currentPath.split('/').filter(Boolean).pop()?.toLowerCase()
  if (slug) {
    const all = await queryCollection('content').all()
    found = all.find((n: any) => {
      const stemSlug = n.stem?.split('/').pop()?.toLowerCase()
      const titleSlug = n.title?.toLowerCase().replace(/\s+/g, '-')
      return stemSlug === slug || titleSlug === slug || n.path.toLowerCase().endsWith(`/${slug}`)
    })
    if (found) return found
  }

  return null
})

useHead({
  title: computed(() => page.value?.title ? `${page.value.title} · Appunti` : 'Appunti'),
  meta: [
    {
      name: 'description',
      content: computed(() => (page.value as any)?.description || 'Obsidian Notes Website')
    }
  ]
})
</script>

<template>
  <div class="note-page">
    <!-- 1. Se la pagina (o index.md) esiste: renderizza il suo contenuto -->
    <article v-if="page" class="space-y-6">
      <!-- Immagine di copertina (Cover) opzionale -->
      <div v-if="(page as any)?.cover" class="-mx-6 sm:-mx-12 -mt-8 md:-mt-14 mb-8 overflow-hidden rounded-b-xl max-h-56">
        <img
          :src="(page as any).cover"
          alt="Cover"
          class="w-full h-full object-cover"
        >
      </div>

      <!-- Header della Pagina Notion -->
      <header class="space-y-3 pb-4">
        <!-- Icona della Nota (Emoji o icona predefinita) -->
        <div class="text-4xl sm:text-5xl select-none mb-2">
          <span>{{ (page as any)?.icon || (isHome ? '🌿' : '📄') }}</span>
        </div>

        <!-- Titolo della Nota -->
        <h1 class="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
          {{ page.title || (isHome ? 'Index' : 'Senza titolo') }}
        </h1>

        <!-- Proprietà della Nota (Notion Properties) -->
        <div v-if="(page as any)?.date || (page as any)?.tags" class="flex flex-wrap items-center gap-2 pt-2 text-xs text-neutral-500 dark:text-neutral-400">
          <!-- Data -->
          <div v-if="(page as any)?.date" class="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-neutral-100 dark:bg-neutral-800/80">
            <UIcon name="i-lucide-calendar" class="w-3.5 h-3.5" />
            <span>{{ (page as any).date }}</span>
          </div>

          <!-- Tags -->
          <div v-if="(page as any)?.tags" class="flex flex-wrap gap-1">
            <span
              v-for="tag in (Array.isArray((page as any).tags) ? (page as any).tags : [(page as any).tags])"
              :key="tag"
              class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200/60 dark:border-neutral-700/60"
            >
              #{{ tag }}
            </span>
          </div>
        </div>

        <!-- Divisore sottile Notion -->
        <hr class="border-t border-neutral-200/60 dark:border-neutral-800/80 pt-2">
      </header>

      <!-- Corpo del Contenuto Markdown (con i link scritti dall'utente) -->
      <ContentRenderer :value="page" class="notion-prose" />
    </article>

    <!-- 2. Se siamo sulla Home ma non è stato ancora creato index.md -->
    <div v-else-if="isHome" class="space-y-6">
      <header class="space-y-2">
        <div class="text-5xl mb-2 select-none">
          🌿
        </div>
        <h1 class="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
          I Miei Appunti
        </h1>
        <p class="text-sm text-neutral-500 dark:text-neutral-400">
          Crea un file <code class="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-xs">index.md</code> nel tuo vault per personalizzare questa pagina iniziale e aggiungere i collegamenti alle tue note.
        </p>
      </header>
    </div>

    <!-- 3. Pagina 404 (Nota specifica non trovata) -->
    <div v-else class="text-center py-16 space-y-4">
      <div class="text-5xl select-none">
        🔍
      </div>
      <h2 class="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
        Nota non trovata
      </h2>
      <p class="text-sm text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto">
        La nota a cui stai tentando di accedere non esiste o è stata spostata.
      </p>
      <div class="pt-2">
        <UButton
          to="/"
          icon="i-lucide-arrow-left"
          color="neutral"
          variant="outline"
          size="sm"
        >
          Torna all'indice
        </UButton>
      </div>
    </div>
  </div>
</template>
