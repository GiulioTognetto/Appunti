<!-- components/content/ProseA.vue -->
<script setup lang="ts">
const props = defineProps<{
  href?: string
  target?: string
}>()

const computedHref = computed(() => {
  if (!props.href) return '#'

  // Link esterni
  if (props.href.startsWith('http://') || props.href.startsWith('https://') || props.href.startsWith('mailto:')) {
    return props.href
  }

  // Assicura che i link interni partano dalla radice del sito
  if (!props.href.startsWith('/')) {
    return `/${props.href}`
  }

  return props.href
})
</script>

<template>
  <NuxtLink :to="computedHref" :target="target">
    <slot />
  </NuxtLink>
</template>