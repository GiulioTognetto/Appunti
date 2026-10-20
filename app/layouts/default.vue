<!-- app/layouts/default.vue -->
<script setup lang="ts">
import AppNavbar from '~/components/AppNavbar.vue'
import AppSidebar from '~/components/AppSidebar.vue'
</script>

<template>
  <div class="min-h-screen flex bg-white dark:bg-[#191919] text-[#37352f] dark:text-[#e3e2e0] transition-colors">
    <!-- Sidebar -->
    <AppSidebar />

    <!-- Area Contenuto Principale -->
    <div class="flex-1 flex flex-col min-w-0">
      <!-- Navbar Superiore -->
      <AppNavbar />

      <!-- Contenitore Centrale (Notion Style) -->
      <main class="flex-1 w-full max-w-3xl mx-auto px-6 sm:px-12 py-8 md:py-14">
        <slot />
      </main>
    </div>
  </div>
</template>

