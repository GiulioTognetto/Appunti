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

  // Se è una rotta basata su hash /p/a1b2c3d4, aggiunge la posizione corrente per il contesto
  if (props.href.startsWith('/p/') || props.href.startsWith('p/')) {
    const basePath = props.href.startsWith('/') ? props.href : `/${props.href}`
    return `${basePath}?from=${encodeURIComponent(route.path)}`
  }

  return props.href
})
</script>

<template>
  <NuxtLink :to="computedHref" :target="target">
    <slot />
  </NuxtLink>
</template>