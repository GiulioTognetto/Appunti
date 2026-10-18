<!-- components/content/ProseA.vue -->
<script setup lang="ts">
const props = defineProps<{
  href?: string
  target?: string
}>()

const route = useRoute()

const computedHref = computed(() => {
  if (!props.href) return '#'

  // Se è un URL esterno
  if (props.href.startsWith('http://') || props.href.startsWith('https://')) {
    return props.href
  }

  let cleanHref = props.href.endsWith('/index') ? props.href.slice(0, -6) : props.href;

  // Se è già un percorso assoluto che parte dalla radice
  if (cleanHref.startsWith('/')) {
    return cleanHref
  }

  // Se è un link relativo, uniscilo alla cartella corrente dell'URL attuale
  const currentSegments = route.path.split('/').filter(Boolean)
  // Rimuove 'index' dall'URL corrente se presente
  if (currentSegments[currentSegments.length - 1] === 'index') {
    currentSegments.pop()
  }

  const currentDir = '/' + currentSegments.join('/')
  return `${currentDir}/${cleanHref}`.replace(/\/+/g, '/')
})
</script>

<template>
  <NuxtLink :to="computedHref" :target="target">
    <slot />
  </NuxtLink>
</template>