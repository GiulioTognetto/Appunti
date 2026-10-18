<script setup lang="ts">
const props = defineProps<{
  href?: string
  target?: string
}>()

const computedHref = computed(() => {
  if (!props.href) return '#'

  // Gestione link esterni
  if (props.href.startsWith('http://') || props.href.startsWith('https://') || props.href.startsWith('mailto:')) {
    return props.href
  }

  // Garantisce che i link interni partano dalla root
  if (props.href.startsWith('p/')) {
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