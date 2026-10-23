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
            <!-- Slot icona: visualizza emoji o icona file/cartella -->
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

            <!-- Slot label: cliccare sul TESTO naviga alla nota/index -->
            <template #item-label="{ item }">
              <span
                class="truncate text-xs select-none hover:underline cursor-pointer"
                :class="{
                  'font-semibold text-neutral-950 dark:text-white': route.path === (item as any).path
                }"
                @click.stop="onItemLabelClick(item as CustomTreeItem)"
              >
                {{ item.label }}
              </span>
            </template>

            <!-- Slot trailing: freccetta visibile per indicare se la cartella è aperta/chiusa -->
            <template #item-trailing="{ item, expanded }">
              <UIcon
                v-if="item.children?.length"
                :name="expanded ? 'i-lucide-chevron-down' : 'i-lucide-chevron-right'"
                class="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-500 ml-auto shrink-0 transition-transform"
              />
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

// Funzione ricorsiva di ordinamento alfabetico (prima cartelle, poi file)
function sortTreeItems(items: CustomTreeItem[]): CustomTreeItem[] {
  return items
    .map(item => {
      if (item.children && item.children.length > 0) {
        return {
          ...item,
          children: sortTreeItems(item.children)
        }
      }
      return item
    })
    .sort((a, b) => {
      const aIsFolder = Array.isArray(a.children) && a.children.length > 0
      const bIsFolder = Array.isArray(b.children) && b.children.length > 0

      if (aIsFolder && !bIsFolder) return -1
      if (!aIsFolder && bIsFolder) return 1

      return (a.label || '').localeCompare(b.label || '', undefined, {
        numeric: true,
        sensitivity: 'base'
      })
    })
}

// Costruzione gerarchica dell'albero delle note
function buildNoteTree(notes: any[]): CustomTreeItem[] {
  const rootNodes: CustomTreeItem[] = []
  const folderMap = new Map<string, CustomTreeItem>()
  const folderIndexNotes = new Map<string, any>()

  // 1. Mappa i file index delle cartelle (chiave: path della cartella)
  for (const note of notes) {
    if (note.path === '/' || note.stem === 'index') continue

    const isIndex = note.stem?.endsWith('/index') || note.path.endsWith('/index')
    if (isIndex) {
      const folderKey = note.stem.slice(0, -6).replace(/^\//, '')
      folderIndexNotes.set(folderKey, note)
    }
  }

  // 2. Home / Index principale
  const homeNote = notes.find(n => n.path === '/' || n.stem === 'index')
  if (homeNote) {
    rootNodes.push({
      label: homeNote.title || 'Home',
      icon: 'i-lucide-home',
      emoji: homeNote.icon && !homeNote.icon.startsWith('i-') ? homeNote.icon : undefined,
      path: '/',
      value: '/',
    })
  }

  // 3. Costruzione della gerarchia
  for (const note of notes) {
    if (note.path === '/' || note.stem === 'index') continue

    const isIndex = note.stem?.endsWith('/index') || note.path.endsWith('/index')
    if (isIndex) continue

    const cleanStem = note.stem.replace(/^\//, '')
    const parts = cleanStem.split('/')
    const fileName = parts[parts.length - 1]
    const folderParts = parts.slice(0, -1)

    let currentChildren = rootNodes
    let accumulatedKey = ''

    for (let i = 0; i < folderParts.length; i++) {
      const folder = folderParts[i]
      accumulatedKey = accumulatedKey ? `${accumulatedKey}/${folder}` : folder

      let folderNode = folderMap.get(accumulatedKey)

      if (!folderNode) {
        const indexNote = folderIndexNotes.get(accumulatedKey)

        const folderLabel = indexNote?.title || (folder.charAt(0).toUpperCase() + folder.slice(1).replace(/-/g, ' '))
        const folderEmoji = indexNote?.icon && !indexNote.icon.startsWith('i-') ? indexNote.icon : undefined
        const folderIcon = indexNote?.icon && indexNote.icon.startsWith('i-') ? indexNote.icon : undefined
        const folderPath = indexNote ? indexNote.path : undefined

        folderNode = {
          label: folderLabel,
          icon: folderIcon,
          emoji: folderEmoji,
          path: folderPath,
          value: accumulatedKey,
          children: []
        }

        folderMap.set(accumulatedKey, folderNode)
        currentChildren.push(folderNode)
      }

      currentChildren = folderNode.children!
    }

    const emoji = note.icon && !note.icon.startsWith('i-') ? note.icon : undefined
    const icon = note.icon && note.icon.startsWith('i-') ? note.icon : 'i-lucide-file-text'

    currentChildren.push({
      label: note.title || fileName.replace(/-/g, ' '),
      icon,
      emoji,
      path: note.path,
      value: note.path
    })
  }

  // 4. Cartelle che contengono esclusivamente un file index.md
  for (const [folderKey, indexNote] of folderIndexNotes.entries()) {
    if (!folderMap.has(folderKey)) {
      const parts = folderKey.split('/')
      let currentChildren = rootNodes
      let accumulatedKey = ''

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i] ?? ''
        accumulatedKey = accumulatedKey ? `${accumulatedKey}/${part}` : part

        let folderNode = folderMap.get(accumulatedKey)

        if (!folderNode) {
          const isTarget = accumulatedKey === folderKey
          const currentIdxNote = isTarget ? indexNote : folderIndexNotes.get(accumulatedKey)

          folderNode = {
            label: currentIdxNote?.title || (part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' ')),
            icon: currentIdxNote?.icon && currentIdxNote.icon.startsWith('i-') ? currentIdxNote.icon : undefined,
            emoji: currentIdxNote?.icon && !currentIdxNote.icon.startsWith('i-') ? currentIdxNote.icon : undefined,
            path: currentIdxNote ? currentIdxNote.path : undefined,
            value: accumulatedKey,
            children: []
          }

          folderMap.set(accumulatedKey, folderNode)
          currentChildren.push(folderNode)
        }

        currentChildren = folderNode.children!
      }
    }
  }

  const home = rootNodes.find(n => n.value === '/')
  const remainingNodes = rootNodes.filter(n => n.value !== '/')

  const sortedRemaining = sortTreeItems(remainingNodes)

  return home ? [home, ...sortedRemaining] : sortedRemaining
}

// Click sul TESTO: esegue la navigazione diretta interrompendo l'evento di selezione di UTree
function onItemLabelClick(item: CustomTreeItem) {
  if (item.path) {
    handleNavigate(item.path)
  }
}

// Click sull'intera riga (evento nativo di UTree):
// Se è un file singolo naviga, se è una cartella lascia gestire l'espansione/compressione a UTree
function onTreeSelect(event: any, item: CustomTreeItem) {
  if (!item.children || item.children.length === 0) {
    if (item.path) {
      handleNavigate(item.path)
    }
  }
}

function handleNavigate(path: string) {
  navigateTo(path)
  if (typeof window !== 'undefined' && window.innerWidth < 768) {
    close()
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