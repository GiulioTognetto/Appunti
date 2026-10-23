<!-- app/components/content/ProseA.vue -->
<script setup lang="ts">
const props = defineProps<{
  href?: string
  target?: string
}>()

const route = useRoute()

const isExternal = computed(() => {
  if (!props.href) return false
  return /^(https?:|mailto:|tel:)/i.test(props.href)
})

const isAnchor = computed(() => {
  return props.href?.startsWith('#') ?? false
})

const computedHref = computed(() => {
  if (!props.href) return '#'

  // 1. Link esterno o ancore in-page
  if (isExternal.value || isAnchor.value) {
    return props.href
  }

  // 2. Separa query e hash dal percorso
  const [pathAndQuery, hash] = props.href.split('#')
  const [pathname, query] = (pathAndQuery ?? '').split('?')

  // 3. Rimuovi estensione .md e suffisso /index
  let cleanPath = (pathname || '')
    .trim()
    .replace(/\.md$/i, '')
    .replace(/\/index$/i, '')

  if (!cleanPath) cleanPath = '/'

  // 4. Risolvi i percorsi relativi (es. './nota.md', 'nota.md', '../altra.md')
  // Se cleanPath inizia per '/', è già assoluto
  let resolvedPath = cleanPath
  if (!cleanPath.startsWith('/')) {
    const currentPath = route.path || '/'
    const currentDir = currentPath.endsWith('/')
      ? currentPath
      : currentPath.substring(0, currentPath.lastIndexOf('/') + 1) || '/'

    try {
      resolvedPath = new URL(cleanPath, 'http://dummy' + currentDir).pathname
    } catch {
      resolvedPath = '/' + cleanPath
    }
  }

  // Se dopo la risoluzione finisce con /index, ripulisci
  if (resolvedPath.endsWith('/index')) {
    resolvedPath = resolvedPath.slice(0, -6) || '/'
  }

  let finalUrl = resolvedPath
  if (query) finalUrl += `?${query}`
  if (hash) finalUrl += `#${hash}`

  return finalUrl
})
</script>

<template>
  <NuxtLink
    :to="computedHref"
    :target="isExternal ? (target || '_blank') : target"
    :class="[
      'inline cursor-pointer transition-colors font-medium',
      isExternal
        ? 'text-neutral-800 dark:text-neutral-200 underline decoration-neutral-300 dark:decoration-neutral-600 underline-offset-4 hover:decoration-neutral-900 dark:hover:decoration-neutral-100'
        : 'text-neutral-800 dark:text-neutral-200 underline decoration-neutral-300/80 dark:decoration-neutral-600/80 underline-offset-4 hover:text-neutral-950 dark:hover:text-white hover:decoration-neutral-900 dark:hover:decoration-neutral-200'
    ]"
  >
    <slot />
    <UIcon
      v-if="isExternal"
      name="i-lucide-arrow-up-right"
      class="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-500 inline -mt-0.5 ml-0.5"
    />
  </NuxtLink>
</template>
