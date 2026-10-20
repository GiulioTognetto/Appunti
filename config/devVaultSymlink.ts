import fs from 'node:fs'
import path from 'node:path'

/**
 * Gestisce la creazione temporanea di un symlink da `content/` al vault di Obsidian
 * durante la modalità di sviluppo (`dev`). Al termine del processo (SIGINT/SIGTERM/exit),
 * il symlink viene rimosso e viene ripristinata la cartella `content/` vuota con `.gitkeep`.
 */
export function setupDevVaultSymlink() {
  const isDev = process.env.NODE_ENV !== 'production' || process.argv.includes('dev')
  if (!isDev) return

  const vaultPath = process.env.NOTES_VAULT_PATH || process.env.OBSIDIAN_VAULT_PATH
  if (!vaultPath) return

  const resolvedVaultPath = path.resolve(vaultPath)
  const contentDir = path.resolve(process.cwd(), 'content')

  if (!fs.existsSync(resolvedVaultPath)) {
    console.warn(`\n⚠️  [Vault Symlink] Il percorso specificato in NOTES_VAULT_PATH non esiste:\n   ${resolvedVaultPath}\n`)
    return
  }

  const restoreContentDir = () => {
    try {
      if (fs.existsSync(contentDir) && fs.lstatSync(contentDir).isSymbolicLink()) {
        fs.unlinkSync(contentDir)
        fs.mkdirSync(contentDir, { recursive: true })
        fs.writeFileSync(path.join(contentDir, '.gitkeep'), '')
        console.log('\n🧹 [Vault Symlink] Symlink rimosso. Cartella content/ ripristinata.\n')
      }
    } catch {
      // Gestione silenziosa in chiusura
    }
  }

  try {
    if (fs.existsSync(contentDir)) {
      const stat = fs.lstatSync(contentDir)
      if (stat.isSymbolicLink()) {
        const currentTarget = fs.realpathSync(contentDir)
        if (currentTarget !== resolvedVaultPath) {
          fs.unlinkSync(contentDir)
          fs.symlinkSync(resolvedVaultPath, contentDir, 'dir')
          console.log(`\n🔗 [Vault Symlink] Symlink aggiornato: content -> ${resolvedVaultPath}`)
        }
      } else {
        fs.rmSync(contentDir, { recursive: true, force: true })
        fs.symlinkSync(resolvedVaultPath, contentDir, 'dir')
        console.log(`\n🔗 [Vault Symlink] Symlink creato: content -> ${resolvedVaultPath}`)
      }
    } else {
      fs.symlinkSync(resolvedVaultPath, contentDir, 'dir')
      console.log(`\n🔗 [Vault Symlink] Symlink creato: content -> ${resolvedVaultPath}`)
    }
  } catch (err) {
    console.error('❌ [Vault Symlink] Errore nella creazione del symlink:', err)
    return
  }

  let cleanedUp = false
  const cleanup = () => {
    if (cleanedUp) return
    cleanedUp = true
    restoreContentDir()
  }

  process.once('SIGINT', () => {
    cleanup()
    process.exit(0)
  })
  process.once('SIGTERM', () => {
    cleanup()
    process.exit(0)
  })
  process.once('exit', cleanup)

  return cleanup
}

