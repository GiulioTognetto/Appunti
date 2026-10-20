// app/composables/useSidebar.ts
export const useSidebar = () => {
  // Parte sempre chiusa di default sia su mobile che su desktop
  const isOpen = useState<boolean>('sidebar-open', () => false)

  const toggle = () => {
    isOpen.value = !isOpen.value
  }

  const close = () => {
    isOpen.value = false
  }

  const open = () => {
    isOpen.value = true
  }

  return {
    isOpen,
    toggle,
    close,
    open
  }
}
