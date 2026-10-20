<!-- app/components/AppNavbar.vue -->
<script setup lang="ts">
const { isOpen, toggle } = useSidebar()
const colorMode = useColorMode()
const route = useRoute()

const isDark = computed({
  get: () => colorMode.value === 'dark',
  set: () => {
    colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
  }
})

// Suddivide il path della route in segmenti per i breadcrumb
const breadcrumbs = computed(() => {
  const segments = route.path.split('/').filter(Boolean)
  if (segments.length === 0) {
    return [{ label: 'Home', path: '/' }]
  }

  const items = [{ label: 'Home', path: '/' }]
  let currentPath = ''
  for (const seg of segments) {
    currentPath += `/${seg}`
    items.push({
      label: decodeURIComponent(seg).replace(/-/g, ' '),
      path: currentPath
    })
  }
  return items
})
</script>

<template>
  <header class="sticky top-0 z-30 flex items-center justify-between h-12 px-4 backdrop-blur-md bg-white/80 dark:bg-[#191919]/80 border-b border-neutral-200/50 dark:border-neutral-800/80 transition-colors">
    <!-- Lato Sinistro: Toggle Sidebar e Breadcrumbs -->
    <div class="flex items-center gap-2 overflow-hidden text-sm">
      <UButton
        :icon="isOpen ? 'i-lucide-panel-left-close' : 'i-lucide-panel-left'"
        color="neutral"
        variant="ghost"
        size="sm"
        aria-label="Toggle Sidebar"
        class="shrink-0 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
        @click="toggle"
      />

      <nav class="flex items-center gap-1.5 overflow-hidden text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 font-normal">
        <template v-for="(crumb, index) in breadcrumbs" :key="crumb.path">
          <NuxtLink
            :to="crumb.path"
            class="truncate hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
            :class="{ 'text-neutral-900 dark:text-neutral-100 font-medium': index === breadcrumbs.length - 1 }"
          >
            {{ crumb.label }}
          </NuxtLink>
          <span v-if="index < breadcrumbs.length - 1" class="text-neutral-400 dark:text-neutral-600">/</span>
        </template>
      </nav>
    </div>

    <!-- Lato Destro: Azioni (Dark mode toggle, ecc.) -->
    <div class="flex items-center gap-1">
      <UButton
        :icon="isDark ? 'i-lucide-sun' : 'i-lucide-moon'"
        color="neutral"
        variant="ghost"
        size="sm"
        aria-label="Cambia tema chiaro/scuro"
        class="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
        @click="isDark = !isDark"
      />
    </div>
  </header>
</template>

