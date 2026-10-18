<template>
  <NuxtLink :to="computedHref" :target="target">
    <slot />
  </NuxtLink>
</template>

<script setup lang="ts">
const props = defineProps<{
  href?: string
  target?: string
}>()

const route = useRoute()

const computedHref = computed(() => {
  if (!props.href) return '#'

  if (props.href.startsWith('http') || props.href.startsWith('/')) {
    return props.href
  }

  const currentSegments = route.path.split('/').filter(Boolean)
  const currentDir = '/' + currentSegments.join('/')
  return `${currentDir}/${props.href}`.replace(/\/+/g, '/')
})
</script>