<!-- app/components/AppSidebar.vue -->
<script setup lang="ts">
import type { TreeItem } from '@nuxt/ui'

const { isOpen, close } = useSidebar()
const route = useRoute()

// Recupera tutte le note per la struttura ad albero
const { data: allNotes } = await useAsyncData('all-notes-tree', () => {
  return queryCollection('content')
    .select('path', 'title', 'stem')
    .all()
})

const searchQuery = ref('')
const expandedNodes = ref<string[]>([])

interface CustomTreeItem extends TreeItem {
  path?: string
  emoji?: string
  children?: CustomTreeItem[]
}

// Algoritmo che trasforma la lista delle note in albero gerarchico per UTree
function buildNoteTree(notes: any[]): CustomTreeItem[] {
  const rootNodes: CustomTreeItem[] = []
  const folderMap = new Map<string, CustomTreeItem>()

  // 1. Mappa tutti i file index.md associati alle cartelle
  const folderIndexNotes = new Map<string, any>()

  for (const note of notes) {
    const isRootIndex = note.path === '/' || note.stem === 'index'
    if (isRootIndex) continue

    const cleanPath = note.path.replace(/^\//, '')
    const parts = cleanPath.split('/')
    const isFolderIndex = parts[parts.length - 1] === 'index' || note.stem?.endsWith('/index')

    if (isFolderIndex) {
      const folderKey = parts.slice(0, -1).join('/')
      folderIndexNotes.set(folderKey, note)
    }
  }

  const sortedNotes = [...notes].sort((a, b) => a.path.localeCompare(b.path))

  // 2. Home / Index principale (in cima all'albero)
  const homeNote = sortedNotes.find(n => n.path === '/' || n.stem === 'index')
  if (homeNote) {
    rootNodes.push({
      label: homeNote.title || 'Home',
      icon: 'i-lucide-home',
      emoji: homeNote.icon && !homeNote.icon.startsWith('i-') ? homeNote.icon : undefined,
      path: '/',
      value: '/',
      onSelect: () => handleNavigate('/')
    })
  }

  // 3. Elabora tutte le altre note
  for (const note of sortedNotes) {
    if (note.path === '/' || note.stem === 'index') continue

    const cleanPath = note.path.replace(/^\//, '')
    const parts = cleanPath.split('/')
    const isIndex = parts[parts.length - 1] === 'index' || note.stem?.endsWith('/index')

    // Se è l'index.md di una cartella, lo associamo direttamente alla cartella stessa (non come file duplicato)
    if (isIndex) continue

    const fileName = parts[parts.length - 1]
    const folderParts = parts.slice(0, -1)

    let currentChildren = rootNodes
    let accumulatedKey = ''
    let accumulatedPath = ''

    // Costruisci le cartelle padre
    for (let i = 0; i < folderParts.length; i++) {
      const folder = folderParts[i]
      accumulatedKey = accumulatedKey ? `${accumulatedKey}/${folder}` : folder
      accumulatedPath += `/${folder}`

      let folderNode = folderMap.get(accumulatedKey)

      if (!folderNode) {
        // Controlla se questa cartella ha un file index.md!
        const indexNote = folderIndexNotes.get(accumulatedKey)

        const folderLabel = indexNote?.title || (folder.charAt(0).toUpperCase() + folder.slice(1).replace(/-/g, ' '))
        const folderEmoji = indexNote?.icon && !indexNote.icon.startsWith('i-') ? indexNote.icon : undefined
        const folderIcon = indexNote?.icon && indexNote.icon.startsWith('i-') ? indexNote.icon : undefined

        // Se la cartella ha un index.md, il suo path punta alla pagina dell'index
        const folderPath = indexNote
          ? (indexNote.path.endsWith('/index') ? indexNote.path.slice(0, -6) || '/' : indexNote.path)
          : undefined

        folderNode = {
          label: folderLabel,
          icon: folderIcon,
          emoji: folderEmoji,
          path: folderPath,
          value: accumulatedPath,
          defaultExpanded: false, // Tutto parte chiuso come richiesto
          children: []
        }

        folderMap.set(accumulatedKey, folderNode)
        currentChildren.push(folderNode)
      }

      currentChildren = folderNode.children!
    }

    // Aggiungi la nota come elemento foglia
    const emoji = note.icon && !note.icon.startsWith('i-') ? note.icon : undefined
    const icon = note.icon && note.icon.startsWith('i-') ? note.icon : 'i-lucide-file-text'

    currentChildren.push({
      label: note.title || fileName.replace(/-/g, ' '),
      icon,
      emoji,
      path: note.path,
      value: note.path,
      onSelect: () => handleNavigate(note.path)
    })
  }

  // 4. Cartelle che contengono SOLTANTO un file index.md (senza altre note)
  for (const [folderKey, indexNote] of folderIndexNotes.entries()) {
    if (!folderMap.has(folderKey)) {
      const parts = folderKey.split('/')
      const folder = parts[parts.length - 1]
      const folderPath = indexNote.path.endsWith('/index') ? indexNote.path.slice(0, -6) || '/' : indexNote.path

      rootNodes.push({
        label: indexNote.title || (folder.charAt(0).toUpperCase() + folder.slice(1).replace(/-/g, ' ')),
        icon: indexNote.icon && indexNote.icon.startsWith('i-') ? indexNote.icon : 'i-lucide-file-text',
        emoji: indexNote.icon && !indexNote.icon.startsWith('i-') ? indexNote.icon : undefined,
        path: folderPath,
        value: folderPath,
        onSelect: () => handleNavigate(folderPath)
      })
    }
  }

  return rootNodes
}

function handleNavigate(path: string) {
  navigateTo(path)
  if (typeof window !== 'undefined' && window.innerWidth < 768) {
    close()
  }
}

// Gestione selezione nodo nell'albero
function onTreeSelect(event: any, item: CustomTreeItem) {
  if (item.path) {
    handleNavigate(item.path)
  }
}

// Filtra l'albero per la barra di ricerca
function filterTree(nodes: CustomTreeItem[], query: string): CustomTreeItem[] {
  const result: CustomTreeItem[] = []

  for (const node of nodes) {
    const labelMatch = (node.label || '').toLowerCase().includes(query)
    const filteredChildren = node.children ? filterTree(node.children, query) : []

    if (labelMatch || filteredChildren.length > 0) {
      result.push({
        ...node,
        defaultExpanded: true,
        children: filteredChildren.length > 0 ? filteredChildren : node.children
      })
    }
  }

  return result
}

const treeItems = computed(() => {
  if (!allNotes.value) return []
  const fullTree = buildNoteTree(allNotes.value)

  if (!searchQuery.value.trim()) {
    return fullTree
  }

  return filterTree(fullTree, searchQuery.value.toLowerCase().trim())
})
</script>

<template>
  <div>
    <!-- Mobile Backdrop -->
    <div
      v-if="isOpen"
      class="fixed inset-0 z-40 bg-black/30 backdrop-blur-xs md:hidden"
      @click="close"
    />

    <!-- Sidebar Container -->
    <aside
      class="fixed top-0 bottom-0 left-0 z-50 md:sticky md:top-0 h-screen w-64 shrink-0 flex flex-col bg-[#fbfbfa] dark:bg-[#202020] border-r border-neutral-200/60 dark:border-neutral-800 transition-all duration-200 ease-in-out select-none"
      :class="[
        isOpen ? 'translate-x-0' : '-translate-x-full md:-ml-64',
      ]"
    >
      <!-- Header della Sidebar -->
      <div class="flex items-center justify-between h-12 px-3 border-b border-neutral-200/40 dark:border-neutral-800/60">
        <NuxtLink to="/" class="flex items-center gap-2 px-1 text-sm font-semibold text-neutral-800 dark:text-neutral-200 hover:opacity-80 transition-opacity">
          <span class="text-base select-none">🌿</span>
          <span class="truncate">Appunti</span>
        </NuxtLink>

        <UButton
          icon="i-lucide-chevron-left"
          color="neutral"
          variant="ghost"
          size="xs"
          aria-label="Chiudi sidebar"
          class="text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-100"
          @click="close"
        />
      </div>

      <!-- Barra di ricerca rapida -->
      <div class="px-3 pt-3 pb-2">
        <div class="relative flex items-center">
          <UIcon name="i-lucide-search" class="absolute left-2.5 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Cerca nota..."
            class="w-full pl-8 pr-2 py-1 text-xs rounded-md bg-neutral-200/50 dark:bg-neutral-800/60 border border-transparent focus:border-neutral-300 dark:focus:border-neutral-700 text-neutral-800 dark:text-neutral-200 placeholder-neutral-400 focus:outline-hidden transition-colors"
          >
        </div>
      </div>

      <!-- Albero delle Note con UTree -->
      <nav class="flex-1 overflow-y-auto px-2 py-2 text-sm">
        <div class="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
          Vault
        </div>

        <template v-if="treeItems.length > 0">
          <UTree
            v-model:expanded="expandedNodes"
            :items="treeItems"
            color="neutral"
            size="sm"
            :ui="{
              root: 'space-y-0.5',
              link: 'text-xs py-1 px-2 rounded-md hover:bg-neutral-200/60 dark:hover:bg-neutral-800/70 text-neutral-700 dark:text-neutral-300 font-normal transition-colors cursor-pointer',
              linkLeadingIcon: 'w-3.5 h-3.5 shrink-0',
              linkLabel: 'truncate text-xs'
            }"
            @select="onTreeSelect"
          >
            <!-- Slot icona: emoji personalizzata o cartella/file -->
            <template #item-leading="{ item, expanded }">
              <span v-if="(item as any).emoji" class="text-sm shrink-0 mr-1 select-none">
                {{ (item as any).emoji }}
              </span>
              <UIcon
                v-else-if="item.children?.length"
                :name="expanded ? 'i-lucide-folder-open' : 'i-lucide-folder'"
                class="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400 shrink-0"
              />
              <UIcon
                v-else
                :name="item.icon || 'i-lucide-file-text'"
                class="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-500 shrink-0"
              />
            </template>

            <!-- Slot label con evidenziazione nota attiva -->
            <template #item-label="{ item }">
              <span
                class="truncate text-xs"
                :class="{
                  'font-semibold text-neutral-950 dark:text-white': route.path === (item as any).path
                }"
              >
                {{ item.label }}
              </span>
            </template>
          </UTree>
        </template>

        <div v-else class="px-3 py-6 text-xs text-neutral-400 dark:text-neutral-500 text-center">
          Nessuna nota trovata
        </div>
      </nav>

      <!-- Footer della Sidebar -->
      <div class="p-3 border-t border-neutral-200/40 dark:border-neutral-800/60 text-[11px] text-neutral-400 dark:text-neutral-500 flex items-center justify-between">
        <span>Obsidian Vault</span>
        <span>Nuxt Content</span>
      </div>
    </aside>
  </div>
</template>
